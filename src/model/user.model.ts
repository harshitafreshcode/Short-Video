import { text } from "body-parser";
import { AppDataSource } from "../config/db";
import { hashPassword } from "../config/utilies";
import { Role } from "../entities/role.entity";
import { User } from "../entities/user.entity";

export async function addUser(where: any, data: any, callback: any) {
    try {
        // let { email } = where
        const userRepository = AppDataSource.getRepository(User);

        const res = JSON.parse(JSON.stringify(data));
        const roleRepository = AppDataSource.getRepository(Role);
        const roleList = await roleRepository
            .createQueryBuilder('role')
            .where('role.id =:id', { id: res.role_id })
            .getOne();

        res.role = roleList;

        const hash_password = await hashPassword(res.password)
        res.password = hash_password

        //......... If you want to store in memory not in db then it is used
        // const user = userRepository.create(res);
        // console.log(user, 'user');
        // callback('', user)

        await AppDataSource
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(res)
            .returning('*')
            .execute()
            .then((result) => {
                console.log(result, 'result');
                callback('', result.raw[0])
            }).catch((err) => {
                callback(err, '')
            });

        let user = await AppDataSource.manager.save(User, res)
        console.log(user, 'user');
        callback('', user)

        // await AppDataSource
        //     .createQueryBuilder()
        //     .insert()
        //     .into(User)
        //     .values(res)
        //     // .orUpdate(["email"])
        //     .execute()
        //     .then((result) => {
        //         callback('', result)
        //     }).catch((err) => {
        //         callback(err, '')

        //     });
    } catch (error: any) {
        console.log(error);
        return callback(error, '')
    }
}

export async function updateUser(where: any, data: any, callback: any) {
    try {
        // let { email } = where
        const userRepository = AppDataSource.getRepository(User);

        const res = JSON.parse(JSON.stringify(data));
        const roleRepository = AppDataSource.getRepository(Role);
        console.log(res.role_id);
        if (res.role_id) {
            const roleList = await roleRepository
                .createQueryBuilder('role')
                .where('role.id =:id', { id: res.role_id })
                .getOne();
            console.log(roleList);
            res.role = roleList;
            delete res.role_id;
        }
        if (res.password) {
            const hash_password = await hashPassword(res.password)
            console.log(hash_password, 'hash_password');
            res.password = hash_password
        }
        console.log(res, 'res');
        await AppDataSource
            .createQueryBuilder()
            .update(User)
            .set(res)
            .where('id =:id', { id: where.id })
            .execute()
            .then((result) => {
                console.log(result);
                callback('', result)
            }).catch((err) => {
                console.log(err, 'err');
                callback(err, '')
            });

    } catch (error: any) {
        console.log(error);
        return callback(error, '')
    }
}

export async function FindAllUser(where: any, callback: any) {
    try {
        const status = true;

        const userRepository = AppDataSource.getRepository(User);

        const usersList = await userRepository
            .createQueryBuilder("user")

        if (status) {
            usersList.leftJoinAndSelect("user.role", "role")
        }

        usersList.select(['user'])
            .addSelect(status ? ['role.role_name', 'role.id'] : [])
        // .where("user.name = :name", { name: "Timber" })
        const list = await usersList.getMany();


        return callback('', list, 2)

    } catch (error: any) {
        console.log(error);
        return callback(error, '')
    }
}

export async function deleteUser(where: any, callback: any) {
    try {
        await AppDataSource
            .createQueryBuilder()
            .delete()
            .from(User)
            .where('id = :userId', { userId: where.id })
            .execute()
            .then((result) => {
                callback('', result)
            }).catch((err) => {
                callback(err, '')
            });

    } catch (error: any) {
        console.log(error);
        return callback(error, '')
    }
}

export async function splitVidoes(where: any, data: any, callback: any) {
    try {
        // let { email } = where
        const userRepository = AppDataSource.getRepository(User);

        const res = JSON.parse(JSON.stringify(data));
        const roleRepository = AppDataSource.getRepository(Role);
        console.log(res.role_id);
        if (res.role_id) {
            const roleList = await roleRepository
                .createQueryBuilder('role')
                .where('role.id =:id', { id: res.role_id })
                .getOne();
            console.log(roleList);
            res.role = roleList;
            delete res.role_id;
        }
        if (res.password) {
            const hash_password = await hashPassword(res.password)
            console.log(hash_password, 'hash_password');
            res.password = hash_password
        }
        console.log(res, 'res');
        await AppDataSource
            .createQueryBuilder()
            .update(User)
            .set(res)
            .where('id =:id', { id: where.id })
            .execute()
            .then((result) => {
                console.log(result);
                callback('', result)
            }).catch((err) => {
                console.log(err, 'err');
                callback(err, '')
            });

    } catch (error: any) {
        console.log(error);
        return callback(error, '')
    }
}
