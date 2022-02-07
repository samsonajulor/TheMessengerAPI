import { Request, Response, NextFunction } from 'express'
import { result, String } from 'lodash'
import { trusted } from 'mongoose';
import { User } from '../model/userModel'
import {ChatRoom} from '../model/groupModel'
import { customRequest } from '../utils/interface';
import { FriendList} from '../model/friendListModel';

//search for friend amidst the list of friends
export const search_friend = async (Expressreq: Request, res: Response, next: NextFunction) => {
    const req = Expressreq as customRequest;
    const loginId = req.user._id;
    // console.log(loginId);
    try {
        const query = req.params.query;
        let user = await User.findById(loginId).populate({ path: "friends", match: { type: query } });
        let result = user?.friends?.filter((data: any) => data.fullName.toLowerCase().includes(query.toLowerCase()) && data.isFavourite === false)
        if(result?.length === 0) return res.status(404).json("Search Term Not Found");
        return res.status(200).json({ result })           
    } catch (error) {
        res.status(400).json("Error Occurred") 
    }
 
}
    
//search for a particular friend amidst you your facvourite friends
export const search_favourite = async (Expressreq: Request, res: Response, next: NextFunction) => {
     const req = Expressreq as customRequest;
    const loginId = req.user._id;
    try {

         const query = req.params.query;
         let user = await User.findById(loginId).populate({ path: "friends", match: { type: query }, });
         let result = user?.friends?.filter( (data: any) => data.fullName.toLowerCase().includes(query.toLowerCase()) && data.isFavourite === true );
        if (result?.length === 0) return res.status(404).json("Search Term Not Found");
        return res.status(200).json({ result }); 
    
    } catch (error: any) {
     console.log(error.message)
    }
 

}
 

//Search for the group you are a member by type the name of the group
export const search_groups = async ( Expressreq: Request, res: Response, next: NextFunction ) => {
  const req = Expressreq as customRequest;
  const loginEmail = req.user.email;
//   console.log(loginEmail);
  try { 
    const query = req.params.query;
      const groups = await ChatRoom.find({ group_members: loginEmail }).populate('group_members')
      
      const result = groups?.filter((group) => group.group_name.toLowerCase().includes(query.toLowerCase())).map(({ group_name, group_members, author })=> {
          return {
            GroupName:group_name,
            GroupMembers: group_members,
            GroupAuthor: author,
          };
      })
    if (result?.length === 0) return res.status(404).json("Search Term Not Found");
    return res.json({ result });
   
  } catch (error: any) {
    res.status(400).json(error.message);
  }
};


export const friendlist = async (Expressreq: Request, res: Response, next: NextFunction) => {
     const req = Expressreq as customRequest;
    const loginEmail = req.user.email;
    
    try {
        const query = req.params.query;
        //let results = await FriendList.find({ userId: _id }).populate("userId", "_id firstName lastName email");
         let results = await FriendList.find({ $text: { $search: query } });
    } catch (err: any) {
        res.status(400).json(err.message);
    }
};