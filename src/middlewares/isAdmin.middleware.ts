const admin: boolean = true;

export default function isAdmin(req, res, next) {
    if (admin) {
        console.log('Administrator access granted');
        next();
    } else {
        console.log('Administrator access denied');
        res.status(400).send('Access Denied');
    }
}
