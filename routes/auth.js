const express = require('express');
const request = require('request');

const admin = require('firebase-admin');

const firebaseConfig = require('../config/thingu-59188-firebase-adminsdk-mce7t-39e7a1813f.json');
admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: 'https://thingu-59188-default-rtdb.asia-southeast1.firebasedatabase.app'
});
const firebaseApiKey = 'AIzaSyA-zYRtwwuOL-zDKQrFi5qF06imxkCdOFk';

const router = express.Router();

router.post('/register', (req, res, next) => {
    const { name, sID, password, nickName, sex, emailAddress } = req.body;

    let result = {};

    admin.auth().createUser({
        email: `${sID}@mju.ac.kr`,
        password: password,
    })
    .then((userRecord) => {
        admin.firestore().collection('User').doc(userRecord.uid).set({
            emailAddress: emailAddress,
            name: name,
            nickName: nickName,
            sex: sex,
        });

        result = Object.assign(result, {
            status: 200,
            message: '회원가입 완료'
        });
    })
    .catch((error) => {
        result.status = 400;

        if (error.code === 'auth/email-already-exists') {
            console.log('That email address is already in use!');

            result.message = '이미 가입된 학번입니다.';
        } else {
            console.error(error);

            result.message = error;
        }
        // if (error.code === 'auth/invalid-email') {
        //     console.log('That email address is invalid!');
        // }
    })
    .finally(() => {
        console.log(result);
        res.json(result);
    });
});

router.post('/login', (req, res, next) => {
    const { sID, password } = req.body;

    let result = {};

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
    const payload = {
        email: `${sID}@mju.ac.kr`,
        password: password,
        returnSecureToken: true,
    }
    const options = {
        url: url,
        method: 'POST',
        body: payload,
        json: true,
    }

    request.post(options, (httpErr, httpRes, httpBody) => {
        console.log(httpBody);
        if (httpBody.error !== undefined) {
            const errMsg = httpBody.error.message;

            result = Object.assign(result, {
                status: 400,
                message: errMsg,
            });

            // if (errMsg === 'EMAIL_NOT_FOUND' || errMsg === 'INVALID_PASSWORD') {
                
            // }
            console.log('Login error.');
        } else {
            result = Object.assign(result, {
                status: 200,
                message: '로그인 성공',
                localId: httpBody.localId,
                idToken: httpBody.idToken,
                refreshToken: httpBody.refreshToken,
            });
        }

        res.send(result);
    });
});

router.post('/refresh', (req, res, next) => {
    const { localId, refreshToken } = req.body;

    let result = {};

    const url = `https://securetoken.googleapis.com/v1/token?key=${firebaseApiKey}`;
    const payload = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }
    const options = {
        url: url,
        method: 'POST',
        form: payload,
    }

    request.post(options, (httpErr, httpRes, httpBody) => {
        httpBody = JSON.parse(httpBody);
        console.log(httpBody);

        if (httpBody.error !== undefined) {
            // INVALID_ARGUMENT
            const errMsg = httpBody.error.message;
            result = Object.assign(result, {
                status: 400,
                message: errMsg,
            });

            console.log(`Token refresh error: ${errMsg}`);
        } else {
            result = Object.assign(result, {
                status: 200,
                message: '토큰 갱신 성공',
                localId: httpBody.user_id,
                idToken: httpBody.id_token,
                refreshToken: httpBody.refresh_token,
            });
        }

        res.send(result);
    });
});

router.post('/check', (req, res, next) => {
    const { localId, idToken } = req.body;

    let result = {};

    admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
        console.log(decodedToken);

        const uid = decodedToken.uid;
        // // Date.now()는 13자리이므로 1000을 곱해준다.
        // const exp = decodedToken.exp * 1000;

        // if (exp < Date.now()) {
        //     result = Object.assign(result, {
        //         status: 400,
        //         message: '토큰 만료',
        //     });
        // } else 
        if (uid === localId) {
            // 토큰 검증 성공
            result = Object.assign(result, {
                status: 200,
                message: '토큰 검증 성공',
            });
        } else {
            // 토큰 검증 실패
            result = Object.assign(result, {
                status: 400,
                message: '올바르지 않은 토큰입니다.',
            });
        }
    })
    .catch((error) => {
        console.error(error);

        if (error.code === 'auth/argument-error') {
            console.log(error.message);

            result = Object.assign(result, {
                status: 400,
                message: error.message,
            });
        } else if (error.code === 'auth/id-token-expired') {
            result = Object.assign(result, {
                status: 400,
                message: '토큰 만료',
            });
        }
    })
    .finally(() => {
        res.send(result);
    });
});


module.exports = router;
