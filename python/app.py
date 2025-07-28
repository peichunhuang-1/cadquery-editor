from CodeExecutor import CodeExecutor
from fastapi import FastAPI
from pydantic import BaseModel
import uuid

from fastapi.middleware.cors import CORSMiddleware


executors = {}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/executor")
async def create_executor():
    id = str(uuid.uuid4())
    executors[id] = CodeExecutor()
    return {"id": id}

@app.get("/executor/{id}")
async def get_model_list(id: str):
    executor = executors.get(id, None)
    if (executor == None):
        return {"message": f"Warning: executor with id {id} not found"}
    else:
        return {"models": executor.GetModelList()}

class CodeRequest(BaseModel):
    content: str

@app.post("/executor/{id}")
async def upload_code(id: str, req: CodeRequest):
    executor = executors.get(id, None)
    if (executor == None):
        return {"message": f"Warning: executor with id {id} not found"}
    else:
        executor.Load(req.content)
        return {}

@app.put("/executor/{id}")
async def edit_code(id: str, req: CodeRequest):
    executor = executors.get(id, None)
    if (executor == None):
        return {"message": f"Warning: executor with id {id} not found"}
    else:
        executor.Load(req.content)
        return {}

@app.delete("/executor/{id}")
async def delete_executor(id: str):
    ret = executors.pop(id, None)
    if (ret == None):
        return {"message": f"Warning: executor with id {id} not found"}
    else:
        return {}

@app.get("/executor/{id}/{model}")
async def get_model(id: str, model: str):
    executor = executors.get(id, None)
    if executor == None:
        return {"message": f"Warning: executor with id {id} not found"}
    workplane = executor.GetModel(model)
    if workplane == None:
        return {"message": f"Warning: model {model} not in executor {id}"}
    return {
        "points": workplane.MeshPoints,
        "vertices": workplane.Vertices,
        "edges": workplane.Edges,
        "faces": workplane.Faces
    }
