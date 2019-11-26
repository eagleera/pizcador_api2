export const getUserDetails = (neode, email) => {
  return neode.first("User", { email: email }).then(user => {
      return Promise.resolve(user.toJson());
    })
};
export const updateUserPassword = (db, userName, pwd) => {
  return db
    .collection("user")
    .updateOne(
      { username: userName },
      {
        $set: { password: pwd }
      }
    )
    .then(r => {
      return Promise.resolve(r.matchedCount);
    })
    .catch(err => {
      return Promise.reject(err);
    });
};
