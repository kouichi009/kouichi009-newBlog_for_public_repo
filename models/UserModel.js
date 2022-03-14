import { db, firebase } from "~/plugins/firebase";

export function UserModel(dict, key) {
  return {
    id: key,
    slug: key,
    name: dict["name"]?.toString(),
    profileImageUrl: dict["profileImageUrl"]?.toString(),
    timestamp: dict["timestamp"] ? dict["timestamp"] : null,
    email: dict["email"]?.toString(),
    status: dict["status"] ? dict["status"] : null //1 active, 2 delete
  };
}

// class UserModel {

//     constructor() {
//         this.id = null;
//         this.email = null;
//         // this.name = null;
//         // this.profileImageUrl = null;
//         // this.timestamp = null;
//         this.status = null; //1 active, 2 delete
//     }

//     static transformUser(/*dict, key*/) {
//         // const user = UserModel();
//         // user.id = key
//         // user.email = dict["email"]
//         // this.status = dict["status"]

//         // return user;
//     }

// }

// export function UserModel() {
//     return {
//         id: null,
//         email: null,
//         name: null,
//         profileImageUrl: null,
//         timestamp: null,
//         status: null //1 active, 2 delete
//     }
// }
