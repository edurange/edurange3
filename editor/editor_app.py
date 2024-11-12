from flask import (
    Flask, 
    send_from_directory,
    jsonify,
    request, 
    redirect
    )
import os

app = Flask(__name__, static_folder="editor/build")

# Helper to check if we're in development mode
def is_dev():
    return os.environ.get("FLASK_ENV") == "development"

@app.route("/")
def serve():
    if is_dev():
        # Redirect to Vite dev server for assets
        return redirect("http://localhost:5173", code=302)
    else:
        # Serve the built React files in production
        return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    if is_dev():
        # Redirect to Vite for asset requests in development
        return redirect(f"http://localhost:5173/{path}", code=302)
    else:
        return send_from_directory(app.static_folder, path)

@app.route("/api/get_data", methods=["GET", "POST"])
def get_data():
    if request.method == "POST":
        data = request.get_json()
        return jsonify({"data POST req received": data})
    return jsonify({"data GET req received": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6543)