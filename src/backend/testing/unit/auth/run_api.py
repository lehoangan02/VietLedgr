import os
import subprocess
# go to the "backend" folder
os.chdir(os.path.join("..", "..", ".."))

# start the fast api application
subprocess.run(["uvicorn", "main:app", "--reload"])