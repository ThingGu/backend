const express = require('express');

const admin = require('firebase-admin');

const router = express.Router();

router.get('/:id', (req, res, next) => {
    const uid = req.params.id;

    admin.firestore().collection('User').doc(uid).get()
    .then((doc) => {
        const userData = doc.data();
        userData.status = 200;

        console.log(userData);

        res.send(userData);
    })
    .catch((error) => {
        console.error(error);

        res.send({
            status: 400,
            message: error,
        });
    });
});

router.put('/:id', (req, res, next) => {
    const uid = req.params.id;

    // req.body가 빈 객체일 시 모든 데이터가 사라지니 주의!
    // => update() 메소드로 교체 필요 (키 삭제 문제 해결해야 함)
    admin.firestore().collection('User').doc(uid).set(req.body)
    .then(() => {
        console.log('수정 성공');

        res.send({
            status: 200,
            message: '사용자 정보 수정 성공',
        });
    })
    .catch((error) => {
        console.error(error);

        res.send({
            status: 400,
            message: error,
        });
    });
});

router.delete('/:id', (req, res, next) => {
    const uid = req.params.id;

    admin.firestore().collection('User').doc(uid).delete()
    .then(() => {
        console.log('사용자 정보 삭제 성공');

        admin.auth().deleteUser(uid)
        .then(() => {
            console.log('사용자 계정 삭제 성공');

            res.send({
                status: 200,
                message: '사용자 삭제 성공',
            });
        })
        .catch((error) => {
            console.log('사용자 계정 삭제 실패');
            console.error(error);

            res.send({
                status: 400,
                message: error,
            });
        });
    })
    .catch((error) => {
        console.log('사용자 정보 삭제 실패');
        console.error(error);

        res.send({
            status: 400,
            message: error,
        });
    });
});

module.exports = router;
