import tkinter as tk
from tkinter import ttk, messagebox
import os
from datetime import datetime
import json

class LogViewer:
    def __init__(self, root):
        self.root = root
        self.root.title("La Résistance - Log Viewer")
        self.root.geometry("1000x600")
        
        # Chemin absolu vers le dossier logs
        self.logs_path = os.path.abspath('logs')
        
        # Variables pour le suivi des logs
        self.last_position = 0
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        self.auto_scroll = True
        
        # Style
        self.root.configure(bg='#2C2F33')
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("Treeview",
                      background="#2C2F33",
                      foreground="white",
                      fieldbackground="#2C2F33")
        style.configure("TLabel",
                      background="#2C2F33",
                      foreground="white")
        
        # Controls frame
        self.controls_frame = ttk.Frame(root)
        self.controls_frame.pack(pady=10, padx=10, fill='x')
        
        # Date selector
        ttk.Label(self.controls_frame, text="Sélectionner une date:").pack(side='left', padx=5)
        self.date_combo = ttk.Combobox(self.controls_frame, values=self.get_log_dates())
        self.date_combo.pack(side='left', padx=5)
        self.date_combo.bind('<<ComboboxSelected>>', self.on_date_selected)
        
        # Auto-scroll toggle
        self.auto_scroll_var = tk.BooleanVar(value=True)
        self.auto_scroll_check = ttk.Checkbutton(
            self.controls_frame, 
            text="Défilement automatique",
            variable=self.auto_scroll_var,
            command=self.toggle_auto_scroll
        )
        self.auto_scroll_check.pack(side='left', padx=20)
        
        # Clear button
        self.clear_button = ttk.Button(
            self.controls_frame,
            text="Effacer",
            command=self.clear_logs
        )
        self.clear_button.pack(side='right', padx=5)
        
        # Log viewer
        self.tree = ttk.Treeview(root, columns=("Time", "Type", "Channel", "Content"), show="headings")
        self.tree.heading("Time", text="Heure")
        self.tree.heading("Type", text="Type")
        self.tree.heading("Channel", text="Salon")
        self.tree.heading("Content", text="Contenu")
        
        self.tree.column("Time", width=100)
        self.tree.column("Type", width=100)
        self.tree.column("Channel", width=150)
        self.tree.column("Content", width=600)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(root, orient='vertical', command=self.tree.yview)
        scrollbar.pack(side='right', fill='y')
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(pady=10, padx=10, fill='both', expand=True)
        
        # Export button
        export_button = ttk.Button(root, text="Exporter en JSON", command=self.export_logs)
        export_button.pack(pady=10)
        
        # Set current date if available
        today = datetime.now().strftime("%Y-%m-%d")
        if today in self.date_combo['values']:
            self.date_combo.set(today)
            self.load_logs(None)
    
    def get_log_dates(self):
        # Vérifier si le dossier logs existe
        if not os.path.exists(self.logs_path):
            messagebox.showerror(
                "Dossier logs manquant",
                "Le dossier 'logs' est introuvable ! Pour corriger :\n\n" +
                "1. Créez un dossier nommé 'logs' à côté de log_viewer.exe\n" +
                "2. Copiez vos fichiers .log dans ce dossier\n\n" +
                f"Chemin attendu : {self.logs_path}"
            )
            return []
        
        dates = []
        try:
            # Lister les fichiers
            files = os.listdir(self.logs_path)
            
            # Filtrer les fichiers .log
            for file in files:
                if file.endswith('.log'):
                    dates.append(file.replace('.log', ''))
            
            # Vérifier si des logs ont été trouvés
            if not dates:
                messagebox.showwarning(
                    "Aucun log trouvé",
                    "Aucun fichier .log n'a été trouvé dans le dossier 'logs' !\n\n" +
                    "Assurez-vous d'avoir copié vos fichiers .log dans le dossier."
                )
            
            return sorted(dates, reverse=True)
            
        except Exception as e:
            messagebox.showerror(
                "Erreur de lecture",
                "Impossible de lire le dossier 'logs' !\n\n" +
                "Vérifiez que vous avez les droits d'accès au dossier."
            )
            return []
    
    def process_log_line(self, line):
        try:
            line = line.strip()
            if not line or not (line.startswith('[') and ']' in line):
                return
                
            # Extraire l'heure
            time_end = line.find(']')
            if time_end == -1:
                return
            time = line[1:time_end]
            
            # Extraire le type
            type_start = line.find('[', time_end) + 1
            type_end = line.find(']', type_start)
            if type_start == -1 or type_end == -1:
                return
            type_part = line[type_start:type_end]
            
            # Extraire le reste
            rest = line[type_end + 2:].strip()
            
            # Gérer les réponses
            if type_part == 'RÉPONSE':
                if '↳ En réponse à' in rest:
                    parts = rest.split(':', 1)
                    if len(parts) >= 2:
                        user = parts[0].replace('↳ En réponse à', '').strip()
                        content = parts[1].strip()
                        self.tree.insert('', 'end', values=(time, type_part, user, content))
                return
            
            # Gérer les messages normaux
            if ' dans #' in rest:
                user_part, channel_msg = rest.split(' dans #', 1)
                if ':' in channel_msg:
                    channel, content = channel_msg.split(':', 1)
                    self.tree.insert('', 'end', values=(time, type_part, channel, f"{user_part}: {content.strip()}"))
                    
                    # Auto-scroll si activé
                    if self.auto_scroll_var.get():
                        self.tree.yview_moveto(1)
                        
        except Exception as e:
            pass
    
    def update_logs(self):
        try:
            log_file = os.path.join(self.logs_path, f'{self.current_date}.log')
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    # Aller à la dernière position connue
                    f.seek(self.last_position)
                    
                    # Lire les nouvelles lignes
                    for line in f:
                        self.process_log_line(line)
                    
                    # Sauvegarder la nouvelle position
                    self.last_position = f.tell()
        except Exception as e:
            pass
            
        # Mettre à jour toutes les secondes
        self.root.after(1000, self.update_logs)
    
    def on_date_selected(self, event):
        date = self.date_combo.get()
        if date != self.current_date:
            self.current_date = date
            self.last_position = 0
            self.clear_logs()
    
    def clear_logs(self):
        self.tree.delete(*self.tree.get_children())
    
    def toggle_auto_scroll(self):
        self.auto_scroll = self.auto_scroll_var.get()
    
    def load_logs(self, event=None):
        self.clear_logs()
        log_file = os.path.join(self.logs_path, f'{self.current_date}.log')
        
        if not os.path.exists(log_file):
            return
        
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for line in lines:
                    self.process_log_line(line)
                self.last_position = os.path.getsize(log_file)
        except Exception as e:
            pass
    
    def export_logs(self):
        date = self.date_combo.get()
        if not date:
            messagebox.showerror("Erreur", "Veuillez sélectionner une date")
            return
        
        logs = []
        for item in self.tree.get_children():
            values = self.tree.item(item)['values']
            logs.append({
                'time': values[0],
                'type': values[1],
                'channel': values[2],
                'content': values[3]
            })
        
        export_file = f'logs_export_{date}.json'
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(logs, f, ensure_ascii=False, indent=2)
        
        messagebox.showinfo("Succès", f"Logs exportés dans {export_file}")

if __name__ == '__main__':
    root = tk.Tk()
    app = LogViewer(root)
    app.update_logs()  # Démarrer la mise à jour automatique
    root.mainloop()
