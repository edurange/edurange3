
export async function fetchScenarioList() {
    try {
        const response = await axios.get("/get_scenarios");
        if (response.data.scenarioTable) {
            return response.data.scenarioTable;
        };
    }
    catch (error) { console.log('get_scenarios_list error:', error); };
};


export async function getScenarioMeta(scenario_id) {
    try {
        const response = await axios.get("/get_scenario_meta");
        if (response.data.meta) {
            return response.data.meta;
        };
    }
    catch (error) { console.log('get_scenarios_meta error:', error); };
};

