from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def dashboard():
    return render_template('dashboard.html', active_page='dashboard')

@app.route('/campana')
def campana():
    return render_template('campana.html', active_page='campana')

@app.route('/modelo')
def modelo():
    return render_template('modelo.html', active_page='modelo')

if __name__ == '__main__':
    # Configuración para acceder por IP y puerto específico
    app.run(host='0.0.0.0', port=5000, debug=True)