import ast
import types
import traceback
from WorkPlaneImpl import WorkPlaneImpl
class CodeExecutor:
    def __init__(self):
        self.ctx = {}
    
    def Load(self, source):
        self.ctx = {}
        source = "import cadquery as cq\n" + source
        try:
            tree = ast.parse(source)
        except Exception as e:
            return (False, "❌ Error parsing ast from source: " + str(e))
        target_func_names = []
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                for deco in node.decorator_list:
                    if isinstance(deco, ast.Name) and deco.id == 'workplane':
                        target_func_names.append(node.name)
        def workplane(fn): return fn  
        mod = types.ModuleType("mod")
        mod.__dict__['workplane'] = workplane
        try:
            exec(source, mod.__dict__)
        except Exception as e:
            traceback.print_exc()
            return (False, "❌ Error executing source code" + str(e))
        for name in target_func_names:
            try:
                func = getattr(mod, name, None)
                if callable(func):
                    result = func()
                    self.ctx[name] = result
                else:
                    return (False, f"⚠️ Function {name} is not callable")
            except Exception as e:
                traceback.print_exc()
                return (False, f"❌ Error executing function {name}")
        return (True, f"✅ Function {name} execute successfully")
    
    def GetModel(self, name, tolerance = 0.1, angular_tolerance = 0.1):
        shape = self.ctx.get(name, None)
        if (shape != None):
            workplane = WorkPlaneImpl(shape, tolerance, angular_tolerance)
            return workplane
        else:
            return None
    def GetModelList(self):
        return list(self.ctx.keys())