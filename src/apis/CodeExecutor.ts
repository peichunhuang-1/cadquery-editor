import axios from "axios";
import {url} from './Config';
export async function CreateExecutor() {
    try {
        const res = await axios.post(url + '/executor');
        return res;
    } catch (err) {
        return {data: {"message": err}};
    }
};

export async function UploadCode(id: string, code: string) {
    try {
        const res = await axios.post(
            url + `/executor/${id}`,
            { content: code },
            { headers: { 'Content-Type': 'application/json' }}
        );
        return res;
    } catch (err) {
        return {data: {"message": err}};
    }
}

export async function DeleteExecutor(id: string) {
    try {
        const res = await axios.delete(url + `/executor/${id}`);
        return res;
    } catch (err) {
        return {data: {"message": err}};
    }
}

export async function GetModelList(id: string) {
    try {
        const res = await axios.get(url + `/executor/${id}`);
        return res;
    } catch (err) {
        return {data: {"message": err}};
    }
}

export async function GetModel(id: string, model_name: string) {
    try {
        const res = await axios.get(url + `/executor/${id}/${model_name}`);
        return res;
    } catch (err) {
        return {data: {"message": err}};
    }
}
