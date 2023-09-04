import { Request, Response } from "express";
import { ErrorResponse, successResponse, successResponseWithCount } from "../helpers/apiResponse";
import { FindAllUser, addUser, deleteUser, splitVidoes, updateUser } from "../model/user.model";
import ytdl from 'ytdl-core';
import * as fs from 'fs';


function isBlank(value: any) {
    let result = value === undefined || value === null || value.trim() === '';
    console.log(result, 'result');
    if (result) {
        return true;
    }
    return result
}
export const createUser = (req: Request, res: Response): any => {
    try {

        let where: object = { email: req.body.email };
        let payloadRequest: object = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: req.body.password,
            email: req.body.email,
            phone: req.body.phone,
            status: req.body.status ?? 1,
            role_id: req.body.role_id
        };
        addUser(where, payloadRequest, (err: any, data: any) => {
            if (err) {
                return ErrorResponse(res, err);
            } else {
                return successResponse(res, "User Added Successfully", data);
            }
        });
    } catch (e) {
        console.log(e);
        ErrorResponse(res, e);
    }
};


export const getAllUser = (req: Request, res: Response): any => {
    try {
        let where: object = { id: req.body?.id };
        console.log('12');
        FindAllUser(where, (err: any, data: any, count: number) => {
            if (err) {
                return ErrorResponse(res, err);
            } else {
                return successResponseWithCount(res, "Get All User Successfully.", data, count);
            }
        });
    } catch (e) {
        console.log(e);
        ErrorResponse(res, e);
    }
};

export const removeUser = (req: Request, res: Response): any => {
    try {
        console.log('123');
        console.log(req.params.id, 'req.query.id');
        let where: object = { id: req.params.id };
        deleteUser(where, (err: any, data: any) => {
            if (err) {
                return ErrorResponse(res, err);
            } else {
                return successResponse(res, "User Added Successfully", data);
            }
        });
    } catch (e) {
        console.log(e);
        ErrorResponse(res, e);
    }
};

export const editUser = (req: Request, res: Response): any => {
    try {
        function isBlank(value: any) {
            return value === undefined || value === null || value === '';
        }

        let where: object = { id: req.params.id };
        console.log(isBlank(req.body?.last_name.trim()), 'req.body?.first_name');
        let payloadRequest: object = {
            first_name: req.body?.first_name,
            last_name: isBlank(req.body?.last_name.trim()),
            password: req.body?.password,
            email: req.body?.email,
            phone: req.body?.phone,
            status: req.body?.status ?? 1,
            role_id: req.body?.role_id
        };
        updateUser(where, payloadRequest, (err: any, data: any) => {
            if (err) {
                return ErrorResponse(res, err);
            } else {
                return successResponse(res, "User Added Successfully", data);
            }
        });
    } catch (e) {
        console.log(e);
        ErrorResponse(res, e);
    }
};

