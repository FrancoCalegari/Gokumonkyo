import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os

class CRUDApp:
    def __init__(self, root):
        self.root = root
        self.root.title("CRUD App - Jujutsu Kaisen Habilidades")
        
        self.file_path = ""
        self.data = []
        
        self.create_widgets()
        
    def create_widgets(self):
        self.label_name = tk.Label(self.root, text="Nombre:")
        self.label_name.grid(row=0, column=0, padx=10, pady=10)
        
        self.entry_name = tk.Entry(self.root)
        self.entry_name.grid(row=0, column=1, padx=10, pady=10)
        
        self.label_personaje = tk.Label(self.root, text="Personaje:")
        self.label_personaje.grid(row=1, column=0, padx=10, pady=10)
        
        self.entry_personaje = tk.Entry(self.root)
        self.entry_personaje.grid(row=1, column=1, padx=10, pady=10)
        
        self.label_animacion = tk.Label(self.root, text="Animación:")
        self.label_animacion.grid(row=2, column=0, padx=10, pady=10)
        
        self.entry_animacion = tk.Entry(self.root)
        self.entry_animacion.grid(row=2, column=1, padx=10, pady=10)
        
        self.label_raresa = tk.Label(self.root, text="Rareza:")
        self.label_raresa.grid(row=3, column=0, padx=10, pady=10)
        
        self.raresa_values = ["legendario", "épico", "raro", "normal", "mítico"]
        self.combo_raresa = ttk.Combobox(self.root, values=self.raresa_values, state="readonly")
        self.combo_raresa.grid(row=3, column=1, padx=10, pady=10)
        
        self.button_add = tk.Button(self.root, text="Agregar", command=self.add_entry)
        self.button_add.grid(row=4, column=0, padx=10, pady=10)
        
        self.button_update = tk.Button(self.root, text="Actualizar", command=self.update_entry)
        self.button_update.grid(row=4, column=1, padx=10, pady=10)
        
        self.button_delete = tk.Button(self.root, text="Eliminar", command=self.delete_entry)
        self.button_delete.grid(row=4, column=2, padx=10, pady=10)
        
        self.button_load = tk.Button(self.root, text="Cargar JSON", command=self.load_json)
        self.button_load.grid(row=5, column=0, padx=10, pady=10)
        
        self.button_save = tk.Button(self.root, text="Guardar JSON", command=self.save_json)
        self.button_save.grid(row=5, column=1, padx=10, pady=10)
        
        self.listbox = tk.Listbox(self.root)
        self.listbox.grid(row=6, column=0, columnspan=3, padx=10, pady=10, sticky="nsew")
        self.listbox.bind('<<ListboxSelect>>', self.load_entry)
        
        self.root.grid_rowconfigure(6, weight=1)
        self.root.grid_columnconfigure(2, weight=1)
        
    def load_json(self):
        self.file_path = filedialog.askopenfilename(filetypes=[("JSON Files", "*.json")])
        if not self.file_path:
            return
        with open(self.file_path, 'r') as f:
            self.data = json.load(f)
        self.update_listbox()
        
    def save_json(self):
        if not self.file_path:
            self.file_path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON Files", "*.json")])
        if not self.file_path:
            return
        with open(self.file_path, 'w') as f:
            json.dump(self.data, f, indent=4)
        messagebox.showinfo("Información", "Archivo guardado correctamente")
        
    def update_listbox(self):
        self.listbox.delete(0, tk.END)
        for entry in self.data:
            self.listbox.insert(tk.END, f"{entry['id']}: {entry['name']} ({entry['personaje']})")
        
    def load_entry(self, event):
        selection = self.listbox.curselection()
        if not selection:
            return
        index = selection[0]
        entry = self.data[index]
        self.entry_name.delete(0, tk.END)
        self.entry_name.insert(0, entry['name'])
        self.entry_personaje.delete(0, tk.END)
        self.entry_personaje.insert(0, entry['personaje'])
        self.entry_animacion.delete(0, tk.END)
        self.entry_animacion.insert(0, entry['animacion'])
        self.combo_raresa.set(entry['raresa'])
        self.current_index = index
        
    def add_entry(self):
        new_entry = {
            "id": self.get_next_id(),
            "name": self.entry_name.get(),
            "personaje": self.entry_personaje.get(),
            "animacion": self.entry_animacion.get(),
            "raresa": self.combo_raresa.get()
        }
        self.data.append(new_entry)
        self.update_listbox()
        self.clear_entries()
        
    def update_entry(self):
        if not hasattr(self, 'current_index'):
            return
        self.data[self.current_index] = {
            "id": self.data[self.current_index]['id'],
            "name": self.entry_name.get(),
            "personaje": self.entry_personaje.get(),
            "animacion": self.entry_animacion.get(),
            "raresa": self.combo_raresa.get()
        }
        self.update_listbox()
        self.clear_entries()
        
    def delete_entry(self):
        if not hasattr(self, 'current_index'):
            return
        del self.data[self.current_index]
        self.update_listbox()
        self.clear_entries()
        
    def clear_entries(self):
        self.entry_name.delete(0, tk.END)
        self.entry_personaje.delete(0, tk.END)
        self.entry_animacion.delete(0, tk.END)
        self.combo_raresa.set('')
        self.current_index = None
        
    def get_next_id(self):
        if not self.data:
            return 1
        return max(entry['id'] for entry in self.data) + 1

if __name__ == "__main__":
    root = tk.Tk()
    app = CRUDApp(root)
    root.mainloop()
