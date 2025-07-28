from typing import Tuple
from OCP.gp import gp_Pnt
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeVertex
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS, TopoDS_Shape, TopoDS_Edge, TopoDS_Wire, TopoDS_Face, TopoDS_Vertex
from OCP.TopAbs import TopAbs_WIRE, TopAbs_EDGE, TopAbs_REVERSED, TopAbs_INTERNAL
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Tool
from OCP.TopTools import TopTools_IndexedMapOfShape
from OCP.TopLoc import TopLoc_Location
import cadquery as cq
from cadquery.func import *
from cadquery.selectors import *

class FeatureExtract(Selector):
    def __init__(self, feature):
        self.feature = feature

    def filter(self, _):
        return [self.feature]

Triangles = List[Tuple[int, int, int]]

class WorkPlaneImpl:
    def __init__(self, obj, tolerance: float = 0.1, angular_tolerance: float = 0.1):
        self.obj = obj
        self.vertice_index_map = {}
        self.edge_index_map = TopTools_IndexedMapOfShape()
        self.faces: dict = {}
        self.edges: dict = {} # edges uuid -> [edge1, edge2, ...], edge = [pointi, pointj, ...]
        self.wires: dict = {} # wires uuid -> [wire1, wire2, ...], wire = [edgei, edgej, ...]
        self.vertices: dict = {}
        self._triangulation(tolerance, angular_tolerance)

    def _insert_vertex(self, pnt):
        p = (pnt.X(), pnt.Y(), pnt.Z())
        if self.vertice_index_map.get(p, None) == None:
            ind = len(self.vertice_index_map)
            self.vertice_index_map[p] = ind
        return self.vertice_index_map[p]
    
    def _insert_edge(self, edge: TopoDS_Edge, vertices_in_edge):
        if (not self.edge_index_map.Contains(edge)):
            self.edge_index_map.Add(edge)
            tag = f"edge-{len(self.edges)}"
            self.obj.edges(FeatureExtract(edge)).tag(tag)
            self.edges[tag] = vertices_in_edge
        return self.edge_index_map.FindIndex(edge) - 1
    
    def _traverseWire(self, wire_ex: any, bt, triangulation, location):
        while wire_ex.More():
            wire = TopoDS.Wire_s(wire_ex.Current())
            if not wire:
                wire_ex.Next()
                continue
            edge_ex = TopExp_Explorer(wire, TopAbs_EDGE)
            edges_in_wire = self._traverseEdge(edge_ex, bt, triangulation, location)
            tag = f"wire-{len(self.wires)}"
            self.obj.wires(FeatureExtract(wire)).tag(tag)
            self.wires[tag] = edges_in_wire
            wire_ex.Next()

    def _traverseEdge(self, edge_ex: any, bt, triangulation, location):
        edges_in_wire = []
        while edge_ex.More():
            vertices_in_edge = []
            edge = TopoDS.Edge_s(edge_ex.Current())
            if not edge:
                edge_ex.Next()
                continue
            poly = bt.PolygonOnTriangulation_s(edge, triangulation, location)
            if not poly:
                edge_ex.Next()
                continue
            nb_edge = poly.NbNodes()
            for i in range(1, nb_edge + 1):
                pnt = triangulation.Node(poly.Node(i)).Transformed(location.Transformation())
                vertices_in_edge.append(self._insert_vertex(pnt))
            edges_in_wire.append(self._insert_edge(edge, vertices_in_edge))
            edge_ex.Next()
        return edges_in_wire

    def _parse_face(self, face, triangulation, location):
        nb_nodes = triangulation.NbNodes()
        nb_triangles = triangulation.NbTriangles()
        local_index = {}
        for i in range(1, nb_nodes + 1):
            pnt = triangulation.Node(i).Transformed(location.Transformation())
            local_index[i] = self._insert_vertex(pnt)
        triangles = []
        for i in range(1, nb_triangles + 1):
            i1, i2, i3 = triangulation.Triangle(i).Get()
            if face.wrapped.Orientation() in (TopAbs_REVERSED, TopAbs_INTERNAL):
                i1, i2 = i2, i1
            ind1 = local_index[i1]
            ind2 = local_index[i2]
            ind3 = local_index[i3]
            triangles.append([ind1, ind2, ind3])
        tag = f"face-{len(self.faces)}"
        self.obj.faces(FeatureExtract(face)).tag(tag)
        self.faces[tag] = [list(t) for t in triangles]
    
    def _triangulation(self, tolerance: float, angular_tolerance: float):
        shape = self.obj.val().wrapped
        BRepMesh_IncrementalMesh(shape, tolerance, True, angular_tolerance, True)
        bt = BRep_Tool()
        for face in self.obj.faces():
            location = TopLoc_Location()
            triangulation = bt.Triangulation_s(face.wrapped, location)
            if not triangulation:
                continue
            wire_ex = TopExp_Explorer(face.wrapped, TopAbs_WIRE)
            self._traverseWire(wire_ex, bt, triangulation, location)
            self._parse_face(face, triangulation, location)
        
        for vertex in self.obj.vertices():
            tag = f"vertex-{len(self.vertices)}"
            self.obj.vertices(FeatureExtract(vertex)).tag(tag)
            self.vertices[tag] = self._insert_vertex(BRep_Tool.Pnt_s(vertex.wrapped))
    
    @property
    def MeshPoints(self):
        return list(self.vertice_index_map.keys())
    @property
    def Vertices(self):
        return self.vertices
    @property
    def Edges(self):
        return self.edges
    @property
    def Wires(self):
        return self.wires
    @property
    def Faces(self):
        return self.faces
