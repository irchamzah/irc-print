import os

# folder tempat script ini berada
root_folder = os.path.dirname(os.path.abspath(__file__))

# daftar folder yang mau dikecualikan
exclude_dirs = {".next", "node_modules", ".env", ".env.local", ".git", "gitignore"}

def print_tree(startpath, prefix=""):
    items = os.listdir(startpath)
    items.sort()  # biar urut
    items = [i for i in items if i not in exclude_dirs]  # filter exclude

    for index, item in enumerate(items):
        path = os.path.join(startpath, item)
        connector = "└── " if index == len(items) - 1 else "├── "
        print(prefix + connector + item)
        if os.path.isdir(path):
            extension = "    " if index == len(items) - 1 else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":
    print(os.path.basename(root_folder))
    print_tree(root_folder)
