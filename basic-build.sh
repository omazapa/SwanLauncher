# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
jupyter lab --watch
