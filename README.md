# Social Media App API

## Description
This API provides endpoints for accessing social media functionalities, including user profiles, posts, comments, and more.

### Prerequisites
    - "bcrypt": "^5.1.1",
    - "cloudinary": "^1.41.0",
    - "cors": "^2.8.5",
    - "dotenv": "^16.3.1",
    - "express": "^4.18.2",
    - "helmet": "^7.1.0",
    - "jsonwebtoken": "^9.0.2",
    - "mongoose": "^8.0.2",
    - "morgan": "^1.10.0",
    - "multer": "^1.4.5-lts.1",
    - "nodemailer": "^6.9.7",
    - "validator": "^13.11.0"

## Features
- Feed: Get your followings latest posts then get random posts and if no following return random posts.
- [ image && video ] upload.
- Nested comments
- comments and posts [ like && unlike ]
- Password reset by code sent in email.

- User [Login | Sign Up | Forget Password].
- User [Add | Edit | Delete | Search].
- Post [Add | Edit | Delete | Like | UnLike].
- Comment [Add | Delete | Replay | Like | UnLike]

## Installation
### Requirements
- Node.js
- MongoDB

### Setup
1. Clone this repository.
2. Install dependencies using `npm install`.
3. Configure environment variables (see `.env.sample` for reference).
4. Start the server with `npm start`.

### Endpoints

- URL: example.com/api/...

#### Auth
- `Post /auth/login`: Login [ email && password ].
- `Post /auth/register`: Register [ name && email && password ].

- `POST /auth/forget-pass/get-code`: Send Email With Code [ email ].
- `Post /auth/forget-pass/verify-code`: Verify Code [ code && email ] | This will give you back token you should send it in set-new-pass end point body with new password.
- `Post auth/forget-pass/set-new-pass`: Set New Pass [ token && newPassword ].

#### User
- `GET /user/profile/:userId`: Get User Profile.
- `Put /user/update`: Update User Info [ image || name || bio ].
- `Put /user/change-pass`: Change Password [ oldPass && newPass].
- `Post /user/follow/:userId`: Follow Someone.
- `Post /user/unfollow/:userId`: UnFollow Someone.
- `Post /user/:userId/followers?group=1`: Get User Followers Data ( Each [ ?group ] give you back 10 users ).
- `Post /user/:userId/followings?group=1`: Get User Followings Data ( Each [ ?group ] give you back 10 users ).
- `Post /user/search?name`: Search For User By Name.
- `DELETE /user`: Delete User Account.

#### Posts
- `GET /post/feed?page=1`: Get Feed By Page (Each Page Return 10 Posts).
- `GET /post/user/:userId`: Get User Posts By Id.
- `GET /post/single/:postId`: Get Post By Id.

- `POST /post/create`: Create a new post.
- `Patch /post/edit/:postId`: Update a post.
- `DELETE /post/delete-media/:postId`: Delete Post Media.
- `DELETE /post/delete/:postId`: Delete a post.

- `Get /post/saved?page=1`: Get Saved Posts.
- `POST /post/save/:postId`: Save Post.
- `POST /post/unsave/:postId`:  UnSave Post.

- `Get /post/likes-data/:postId?page=1`: Get Who Liked Post.
- `Post /post/like/:postId`: Like Post.
- `Post /post/unlike/:postId`: UnLike Post.

#### Comments
- `GET /post/comments/:postId?page=1`: Get Post Comments.
- `POST /post/comment/create/:postId`: Add a comment to a post.
- `DELETE /post/comment/:commentId`: Delete a comment.

- `POST /post/comment/replay/:commentId`: Replay a Comment.
- `Delete /post/comment/replay/:commentId`: Delete a Comment Replay.

- `POST /post/comment/like/:commentId`: Like a Comment.
- `POST /post/comment/unlike/:commentId`: Like a Comment.


### Sample Requests
```javascript
// Retrieve all users
fetch('https://example.com/api/users')
  .then(response => response.json())
  .then(data => console.log(data));
```

Error Handling
400 Bad Request: Invalid request format.
401 Unauthorized: Authentication failure.
404 Not Found: Resource not found.

## License

All rights reserved. This project is solely owned by [Karem Mohamed] and is not licensed for use or distribution by others without explicit permission.

## Credits

This project is the intellectual property of [Karem Mohamed] and should not be credited to or used by any other entity without permission.

## Support or Contact

For any inquiries, support, or feedback regarding this project, feel free to reach out:

- **Email**: karem109k@gmail.com
- **Social Media**: {
    [Facebook](https://www.facebook.com/profile.php?id=100008974722319)
    [LinkedIn](https://www.linkedin.com/in/karem-mohamed-a789a6239/)
}

We welcome your input and suggestions! Please don't hesitate to contact us for assistance or to report any issues.