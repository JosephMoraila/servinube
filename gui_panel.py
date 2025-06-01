import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import os
import signal

# Ruta a tu proyecto web
web_project_path = r"D:\josea\José_Andrés\Programación\JavaScript\React\servinubelocal"

# Ruta a tu backend
backend_project_path = r"D:\josea\José_Andrés\Programación\JavaScript\React\servinubelocal\backend"

# Variables para almacenar procesos
frontend_process = None
backend_process = None

# Variables para estados
docker_running = False
frontend_running = False
backend_running = False

def update_status_labels():
    docker_status.config(text="●", fg="green" if docker_running else "red")
    frontend_status.config(text="●", fg="green" if frontend_running else "red")
    backend_status.config(text="●", fg="green" if backend_running else "red")

def start_docker_container():
    global docker_running
    try:
        result = subprocess.run(["docker", "start", "postgres-db"], capture_output=True, text=True)
        if result.returncode == 0:
            docker_running = True
            update_status_labels()
        else:
            messagebox.showerror("Error", "No se pudo iniciar Docker: " + result.stderr)
    except Exception as e:
        messagebox.showerror("Error", str(e))

def stop_docker_container():
    global docker_running
    try:
        subprocess.run(["docker", "stop", "postgres-db"])
        docker_running = False
        update_status_labels()
    except Exception as e:
        messagebox.showerror("Error", str(e))

def start_web_server():
    global frontend_process, frontend_running
    try:
        os.chdir(web_project_path)
        frontend_process = subprocess.Popen(["npm", "run", "dev"], shell=True)
        frontend_running = True
        update_status_labels()
    except Exception as e:
        messagebox.showerror("Error", str(e))

def stop_web_server():
    global frontend_process, frontend_running
    if frontend_process:
        frontend_process.terminate()
        frontend_process = None
        frontend_running = False
        update_status_labels()

def start_backend():
    global backend_process, backend_running
    try:
        os.chdir(backend_project_path)
        backend_process = subprocess.Popen(["npm", "run", "dev"], shell=True)
        backend_running = True
        update_status_labels()
    except Exception as e:
        messagebox.showerror("Error", str(e))

def stop_backend():
    global backend_process, backend_running
    if backend_process:
        backend_process.terminate()
        backend_process = None
        backend_running = False
        update_status_labels()

def start_all():
    start_docker_container()
    start_web_server()
    start_backend()

def stop_all():
    stop_backend()
    stop_web_server()
    stop_docker_container()

# GUI
root = tk.Tk()
root.title("Panel de Control - ServiNube")
root.geometry("400x500")
root.configure(padx=20, pady=20)

# Estilo
style = ttk.Style()
style.configure("Action.TButton", padding=10)

# Frame para estados
status_frame = ttk.LabelFrame(root, text="Estado de Servicios", padding=10)
status_frame.pack(fill="x", pady=(0, 20))

# Estados
ttk.Label(status_frame, text="Docker:").grid(row=0, column=0, padx=5)
docker_status = tk.Label(status_frame, text="●", fg="red")
docker_status.grid(row=0, column=1, padx=5)

ttk.Label(status_frame, text="Frontend:").grid(row=0, column=2, padx=5)
frontend_status = tk.Label(status_frame, text="●", fg="red")
frontend_status.grid(row=0, column=3, padx=5)

ttk.Label(status_frame, text="Backend:").grid(row=0, column=4, padx=5)
backend_status = tk.Label(status_frame, text="●", fg="red")
backend_status.grid(row=0, column=5, padx=5)

# Frame para control general
general_frame = ttk.LabelFrame(root, text="Control General", padding=10)
general_frame.pack(fill="x", pady=(0, 20))

ttk.Button(general_frame, text="Iniciar Todo", command=start_all, style="Action.TButton").pack(fill="x", pady=5)
ttk.Button(general_frame, text="Detener Todo", command=stop_all, style="Action.TButton").pack(fill="x", pady=5)

# Frame para controles individuales
individual_frame = ttk.LabelFrame(root, text="Controles Individuales", padding=10)
individual_frame.pack(fill="x")

ttk.Button(individual_frame, text="Iniciar Docker", command=start_docker_container).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Detener Docker", command=stop_docker_container).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Iniciar Frontend", command=start_web_server).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Detener Frontend", command=stop_web_server).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Iniciar Backend", command=start_backend).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Detener Backend", command=stop_backend).pack(fill="x", pady=2)

root.mainloop()
