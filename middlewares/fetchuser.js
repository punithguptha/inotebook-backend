const jwt=require("jsonwebtoken");

const fetchuser=(req,res,next)=>{
    const token=req.header('auth_token');
    const privateKey=process.env.PRIVATE_KEY?process.env.PRIVATE_KEY:"defaultprivate@key";
    if(!token){
        res.status(401).json({"error":"Please authenticate to use!"});
    }
    try {
        var decoded = jwt.verify(token, privateKey);
        req.user=decoded.user;
        next();
      } catch(err) {
        res.status(401).json({"error":"Invalid Auth Token"});
      }
};

module.exports=fetchuser;