import os

# folder tempat script ini berada (misal: "project/scripts")
script_dir = os.path.dirname(os.path.abspath(__file__))

# Tentukan folder induk sebagai folder root yang akan di-scan.
# Jika script_dir adalah "project/scripts", maka os.path.join(script_dir, os.pardir)
# akan mengarah ke "project".
# os.path.abspath() digunakan untuk membersihkan path menjadi canonical.
root_folder = os.path.abspath(os.path.join(script_dir, os.pardir))

# daftar folder yang mau dikecualikan
# CATATAN: Karena Anda sekarang memindai folder induk, Anda mungkin juga ingin
# mengecualikan folder 'scripts' itu sendiri agar tidak ditampilkan jika Anda
# hanya ingin melihat isi dari folder induk.
exclude_dirs = {".next", "node_modules", ".env", ".env.local", ".git", "gitignore", "scripts"} # 'scripts' ditambahkan

def print_tree(startpath, prefix=""):
    items = os.listdir(startpath)
    items.sort()  # biar urut
    items = [i for i in items if i not in exclude_dirs]  # filter exclude

    for index, item in enumerate(items):
        path = os.path.join(startpath, item)
        connector = "└── " if index == len(items) - 1 else "├── "
        print(prefix + connector + item)
        if os.path.isdir(path):
            extension = "     " if index == len(items) - 1 else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":
    # Cetak nama folder induk ("project")
    print(os.path.basename(root_folder))
    # Mulai pemindaian dari folder induk
    print_tree(root_folder)