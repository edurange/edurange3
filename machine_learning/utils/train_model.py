####################################################################################################
# MODEL TRAINING MODULE
# Module for training and testing classifier on log data from cyber-security training.
# 
# Author: Kristian Tkacik (some slight modifications to main and the type notations)
#
# Takes command arg of
# python py_flask\utils\train_model.py py_flask\log\training_data.csv
####################################################################################################


import math
import os.path
from statistics import mean
from typing import Any
import csv
import sys
import joblib


import matplotlib.pyplot as plt
from pandas import DataFrame, Series

from sklearn.feature_selection import SelectFromModel
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import ConfusionMatrixDisplay
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import RobustScaler
from sklearn.preprocessing import QuantileTransformer


from sklearn.model_selection import StratifiedKFold, GridSearchCV
from sklearn import metrics

from sklearn.ensemble import VotingClassifier



from tqdm import tqdm
from prettytable import PrettyTable, ALL


from feature_extractor import extract_features
from log_parser import Dataset, DatasetRecord, create_dataset_records, read_file


RANDOM_STATE = 0
GS_METRIC = "balanced_accuracy"
INNER_CV_FOLDS = 5
OUTER_CV_FOLDS = 5
CLF = {
   # "Logistic Regression": LogisticRegression(
      #  solver='liblinear', class_weight='balanced', max_iter=1000
   # ),
    "Naive Bayes": GaussianNB(),
}

CLF_PARAM_GRIDS = {
   # "Logistic Regression": {
      #  "classifier__penalty": ['l1', 'l2'],
      #  "classifier__C": [0.001, 0.01, 0.1, 1, 10, 100, 1000],
 #  }
}


def trunc_float(number: float, decimals: int = 3) -> float:
    """
    Truncates float to the specified number of decimals.

    :param number: Float to truncate
    :param decimals: Number of decimals to keep
    :return: Float truncated to the specified number of decimals
    """
    return math.floor(number * 10 ** decimals) / 10 ** decimals


def create_result_table(tab_title: str, rows: list) -> PrettyTable:
    """
    Creates PrettyTable object with the provided rows.

    :param tab_title: String with the title of the table
    :param rows: List of rows to add to the table
    :return: PrettyTable object with the provided rows
    """
    tab = PrettyTable(['', 'Sensitivity', 'Specificity', 'Balanced Accuracy',
                       'AUC', 'Best Params', 'Selected Features'])
    tab.title = f"training_results for {tab_title}"
    tab.vrules = ALL
    tab.hrules = ALL
    tab.align = 'l'
    for row in rows:
        trunc_row = [
            trunc_float(item) if isinstance(item, float)
            else item
            for item in row
        ]
        tab.add_row(trunc_row)
    return tab


def create_figure_with_conf_matrices(conf_matrices: list) -> Any:
    """
    Creates figure with confusion matrices.

    :param conf_matrices: List of confusion matrices
    :return: Figure with confusion matrices
    """
    fig, axs = plt.subplots(2, 5, figsize=(8, 4))
    for i, conf_matrix in enumerate(conf_matrices):
        ConfusionMatrixDisplay(confusion_matrix=conf_matrix).plot(
            ax=axs.flat[i], colorbar=False, cmap='Blues')
        axs.flat[i].label_outer()
        axs.flat[i].set_title(f'Model {i + 1}')
        plt.close()
    return fig


def export_results(clf_name: str, tab: PrettyTable, fig: Any):
    """
    Exports classification training_results of the specified classifier
    to the 'training_results' directory.

    :param clf_name: String with the name of the classifier
    :param tab: PrettyTable object with classification training_results
    :param fig: Figure with confusion matrices
    :return: None
    """
    if not os.path.exists("training_results"):
        os.mkdir("training_results")
    res_file = f"training_results/{clf_name.lower().replace(' ', '_')}_res.txt"
    cm_file = f"training_results/{clf_name.lower().replace(' ', '_')}_cm.pdf"
    print(
        f"Exporting training_results table for {clf_name} to: {res_file}",
        f"\nExporting confusion matrices for {clf_name} to: {cm_file}"
    )
    with open(res_file, 'w', encoding='utf-8') as out:
        print(tab, file=out)
    fig.tight_layout()
    fig.savefig(cm_file)


def export_feature_importance_figure(
        clf_name: str,
        importance_list: list,
        features_list: list
):
    """
    Exports a figure with feature importance for each model trained in the
    outer cross-validation procedure.

    :param clf_name: String with the name of the classifier
    :param importance_list: List of lists with feature importance for
    the models trained in outer cross-validation
    :param features_list: List of lists with selected features for each model
    :return: None
    """
    fig, axs = plt.subplots(5, 2, figsize=(10, 17))
    for i, importance in enumerate(importance_list):
        axs.flat[i].barh(width=importance, y=features_list[i])
        axs.flat[i].set_title(f'Model {i + 1}')
        plt.close()
    fig.tight_layout()
    if not os.path.exists("training_results"):
        os.mkdir("training_results")
    filename = f"training_results/{clf_name.lower().replace(' ', '_')}_importance.pdf"
    print(f"Exporting feature importance figure of {clf_name} to: {filename}")
    fig.savefig(filename)


def nested_cross_val(
        clf_name: str,
        features: DataFrame,
        labels: Series,
        grid: GridSearchCV,
        outer_cv: StratifiedKFold
) -> tuple:
    """
    Performs nested cross-validation. The hyperparameters of the specified
    classifier are tuned in the inner cross-validation loop using grid search.
    The outer cross-validation loop performs the final evaluation.

    :param clf_name: Key to the CLF_TUNED dictionary
    :param features: Dataframe with feature variables
    :param labels: Series with target variable
    :param grid: GridSearchCV object performing hyperparameter tuning
    :param outer_cv: StratifiedKFold object for outer cross-validation
    :return: Lists with result rows, confusion matrices (one row and
    one confusion matrix per model trained in the outer cross validation),
    and feature importance for each model.
    """
    result_rows = []
    conf_matrices = []
    importance_list = []

    for i, (train_idx, test_idx) in tqdm(
            enumerate(outer_cv.split(features, labels)),
            desc=clf_name, ascii=True, total=OUTER_CV_FOLDS):
        grid.fit(features.loc[train_idx], labels.loc[train_idx])
        labels_test = labels.loc[test_idx]
        labels_pred = grid.predict(features.loc[test_idx])
        labels_pred_proba = grid.predict_proba(features.loc[test_idx])[:, 1]

        best_model = grid.best_estimator_.named_steps['classifier']
        conf_matrices.append(
            metrics.confusion_matrix(labels_test, labels_pred)
        )
        result_rows.append([
            f"Model {i + 1}",
            metrics.recall_score(labels_test, labels_pred),
            metrics.recall_score(labels_test, labels_pred, pos_label=0),
            metrics.balanced_accuracy_score(labels_test, labels_pred),
            metrics.roc_auc_score(labels_test, labels_pred_proba),
            grid.best_params_,
            grid.best_estimator_.named_steps['selector']
                .get_feature_names_out(input_features=features.columns),
        ])
        if clf_name in ["Logistic Regression", "SVM Linear"]:
            importance_list.append(best_model.coef_[0])
        elif clf_name in ["XGBoost", "Random Forest", "Decision Tree"]:
            importance_list.append(best_model.feature_importances_)

    result_rows.append([
        'Average',
        mean([row[1] for row in result_rows]),
        mean([row[2] for row in result_rows]),
        mean([row[3] for row in result_rows]),
        mean([row[4] for row in result_rows]),
        '-',
        '-'
    ])
    return result_rows, conf_matrices, importance_list


def train_and_eval(clf_name: str, features: DataFrame, labels: Series):
    """
    Trains and evaluates the specified classifier and exports
    the training_results.

    :param clf_name: Key to the CLF_TUNED dictionary
    :param features: Dataframe with feature variables
    :param labels: Series with target variable
    :return: None
    """
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("selector", SelectFromModel(estimator=LogisticRegression(
            solver='liblinear', penalty='l1',
            max_iter=2000, class_weight='balanced'
        ), threshold='mean')),
        ("classifier", CLF[clf_name]),
    ])
    inner_cv = StratifiedKFold(
        n_splits=INNER_CV_FOLDS, shuffle=True, random_state=RANDOM_STATE
    )
    outer_cv = StratifiedKFold(
        n_splits=OUTER_CV_FOLDS, shuffle=True, random_state=RANDOM_STATE
    )
    grid = GridSearchCV(
        estimator=pipe, param_grid=CLF_PARAM_GRIDS.get(clf_name, {}),
        cv=inner_cv, scoring=GS_METRIC, n_jobs=-1
    )

    res_rows, conf_matrices, importance_list = nested_cross_val(
        clf_name, features, labels, grid, outer_cv
    )

    res_tab = create_result_table(clf_name, res_rows)
    cm_fig = create_figure_with_conf_matrices(conf_matrices)
    export_results(clf_name, res_tab, cm_fig)

    #Exporting model

    if clf_name == "Naive Bayes":
        model_filename = "model/trained_model.joblib"
        joblib.dump(grid.best_estimator_, model_filename)




    #here to place importance feature export:
    if importance_list:
        feature_list = [
            row[6].tolist()
            for row in res_rows[:len(res_rows) - 1]
        ]
        export_feature_importance_figure(
            clf_name, importance_list, feature_list
        )

def main(file_name: str):
    """
    Main function. Parses training data and uses it to
    train and evaluate classifiers.

    :param path: Path to the directory with training data.
    :return: None
    """
    
    plt.switch_backend('agg')
    
    dataset = Dataset()

    log = read_file(file_name)
    create_dataset_records(dataset, "file_wrangler", 13, log)
    dataset.print_stats()
    df = extract_features(dataset)
    df.iloc[:, 11:].describe().transpose().to_csv("training_results/feature-descriptive-stats.csv")
    # test


    x = df.iloc[:,11:-1]
    y = df["struggled"]

    for clf_name in CLF.keys():
        train_and_eval(clf_name, x, y)

        print("\n")    

if __name__ == "__main__":
        #proper arg check
    if len(sys.argv) != 2:
        print('usage: enter file name')
        sys.exit(1)

    file_name = sys.argv[1] 

    

    main(file_name)
