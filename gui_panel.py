import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import time
import os
import re
import threading

web_project_path = r"D:\josea\José_Andrés\Programación\JavaScript\React\servinubelocal"
backend_project_path = r"D:\josea\José_Andrés\Programación\JavaScript\React\servinubelocal\backend"

frontend_process = None
backend_process = None
docker_running = False
frontend_running = False
backend_running = False

def update_status_labels():
    docker_status.config(text="●", fg="green" if docker_running else "red")
    frontend_status.config(text="●", fg="green" if frontend_running else "red")
    backend_status.config(text="●", fg="green" if backend_running else "red")

def is_docker_running():
    try:
        result = subprocess.run(["docker", "info"], capture_output=True, text=True)
        return result.returncode == 0
    except Exception:
        return False

def start_docker_desktop_and_wait():
    global docker_running
    if is_docker_running():
        docker_running = True
        update_status_labels()
        return True

    docker_path = r"C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if not os.path.exists(docker_path):
        messagebox.showerror("Error", f"No se encontró Docker Desktop en {docker_path}")
        return False

    try:
        subprocess.Popen([docker_path])
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo iniciar Docker Desktop: {e}")
        return False

    timeout = 60
    interval = 2
    waited = 0
    while waited < timeout:
        if is_docker_running():
            docker_running = True
            update_status_labels()
            return True
        time.sleep(interval)
        waited += interval

    messagebox.showerror("Error", "Tiempo de espera agotado. Docker no respondió.")
    docker_running = False
    update_status_labels()
    return False

def start_docker_container():
    global docker_running
    if not start_docker_desktop_and_wait():
        return

    try:
        result = subprocess.run(["powershell", "-Command", "docker start postgres-db"], capture_output=True, text=True)
        if result.returncode == 0:
            docker_running = True
            update_status_labels()
        else:
            messagebox.showerror("Error", "No se pudo iniciar el contenedor Docker:\n" + result.stderr)
    except Exception as e:
        messagebox.showerror("Error", str(e))

def stop_docker_container():
    global docker_running
    try:
        subprocess.run(["powershell", "-Command", "docker stop postgres-db"])
        docker_running = False
        update_status_labels()
    except Exception as e:
        messagebox.showerror("Error", str(e))

def start_web_server():
    global frontend_process, frontend_running
    try:
        frontend_output.delete("1.0", tk.END)  # Limpiar salida previa
        urls_text.set("")  # Limpiar URLs previas

        frontend_process = subprocess.Popen(
            ["npx.cmd", "vite", "preview", "--host", "--strictPort"],
            cwd=web_project_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            bufsize=1,
            universal_newlines=True
        )

        frontend_running = True
        update_status_labels()

        threading.Thread(target=monitor_frontend_output, daemon=True).start()
    except Exception as e:
        messagebox.showerror("Error", str(e))

def monitor_frontend_output():
    urls_found = set()
    port = "4173"

    if frontend_process.stdout:
        for line in iter(frontend_process.stdout.readline, ''):
            if not line:
                break
            frontend_output.insert(tk.END, line)
            frontend_output.see(tk.END)

            # Detectar URLs e insertar el puerto
            matches = re.findall(r"http://([\d\.]+)", line)
            for ip in matches:
                full_url = f"http://{ip}:{port}"
                if full_url not in urls_found:
                    urls_found.add(full_url)

            urls_text.set("\n".join(sorted(urls_found)))

def stop_web_server():
    global frontend_process, frontend_running
    if frontend_process:
        frontend_process.terminate()
        frontend_process = None
        frontend_running = False
        update_status_labels()
        urls_text.set("")

def start_backend():
    global backend_process, backend_running
    try:
        backend_process = subprocess.Popen(
            ["powershell", "-Command", "npm start"],
            cwd=backend_project_path
        )
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

# --- GUI ---
root = tk.Tk()
root.iconbitmap(r"D:\josea\José_Andrés\Programación\JavaScript\React\servinubelocal\public\images\favicon.ico")
root.title("Panel de Control - ServiNube")
root.geometry("500x600")
root.configure(padx=20, pady=20)

style = ttk.Style()
style.configure("Action.TButton", padding=10)

status_frame = ttk.LabelFrame(root, text="Estado de Servicios", padding=10)
status_frame.pack(fill="x", pady=(0, 20))

ttk.Label(status_frame, text="Docker:").grid(row=0, column=0, padx=5)
docker_status = tk.Label(status_frame, text="●", fg="red")
docker_status.grid(row=0, column=1, padx=5)

ttk.Label(status_frame, text="Frontend:").grid(row=0, column=2, padx=5)
frontend_status = tk.Label(status_frame, text="●", fg="red")
frontend_status.grid(row=0, column=3, padx=5)

ttk.Label(status_frame, text="Backend:").grid(row=0, column=4, padx=5)
backend_status = tk.Label(status_frame, text="●", fg="red")
backend_status.grid(row=0, column=5, padx=5)

general_frame = ttk.LabelFrame(root, text="Control General", padding=10)
general_frame.pack(fill="x", pady=(0, 20))

ttk.Button(general_frame, text="Iniciar Todo", command=start_all, style="Action.TButton").pack(fill="x", pady=5)
ttk.Button(general_frame, text="Detener Todo", command=stop_all, style="Action.TButton").pack(fill="x", pady=5)

individual_frame = ttk.LabelFrame(root, text="Controles Individuales", padding=10)
individual_frame.pack(fill="x", pady=(0, 10))

ttk.Button(individual_frame, text="Iniciar Docker", command=start_docker_container).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Detener Docker", command=stop_docker_container).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Iniciar Frontend", command=start_web_server).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Detener Frontend", command=stop_web_server).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Iniciar Backend", command=start_backend).pack(fill="x", pady=2)
ttk.Button(individual_frame, text="Detener Backend", command=stop_backend).pack(fill="x", pady=2)

# Mostrar URLs encontradas por vite preview
# Mostrar URLs encontradas por vite preview
urls_text = tk.StringVar()
ttk.Label(root, text="Direcciones del Frontend:").pack(anchor="w", pady=(10, 0))
ttk.Label(root, textvariable=urls_text, foreground="blue", justify="left").pack(anchor="w")

# Mostrar salida completa del frontend
ttk.Label(root, text="Salida de Vite Preview:").pack(anchor="w", pady=(10, 0))
frontend_output = tk.Text(root, height=10, wrap="word")
frontend_output.pack(fill="both", expand=True)


root.mainloop()
