import express from "express";
import passport from "passport";
const router = express.Router();

router.get(
  "/google", passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/dashboard",
  })
);
 
router.get('/logout', function (req: any, res: any){
  res.clearCookie('refreshtoken')
  res.clearCookie('jwtToken')
  res.clearCookie('accessToken')
  req.logOut();
  console.log('logout successful')
  res.status(200).send({ message: 'User sucesssfuly logout' })
  res.redirect('/')
})

//facebook routes

// route middleware to make sure
export function isLoggedIn(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next()
  res.redirect('/auth/retry')
}

router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }))

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }))




export default router