const express = require('express');

const admin = require('firebase-admin');

const router = express.Router();

router.post('/', (req, res, next) => {
    const { creator, date, time, category, description } = req.body;

    admin.firestore().collection('babProfile').add({
        creator: creator,
        date: date,
        time: time,
        category: category,
        description: description,
    })
    .then((doc) => {
        console.log(doc.id);

        res.send({
            status: 200,
            message: '밥 프로필 생성 성공',
            profileId: doc.id,
        });
    })
    .catch((error) => {
        console.error(error);
    });
});

router.get('/user/:id', (req, res, next) => {
    const uid = req.params.id;

    admin.firestore().collection('babProfile').where('creator', '==', uid).get()
    .then((docs) => {
        let data = [];

        docs.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            data.push(Object.assign(doc.data(), { blockId: doc.id }));
        });

        res.send({
            status: 200,
            data: data
        });
    })
    .catch((error) => {
        console.error(error);
    });
});

router.get('/:pid', (req, res, next) => {
    const pid = req.params.pid;

    admin.firestore().collection('babProfile').doc(pid).get()
    .then((doc) => {
        console.log(doc.data());

        res.send(Object.assign(doc.data(), { status: 200 }));
    })
    .catch((error) => {
        console.error(error);
    })
});

router.put('/:pid', (req, res, next) => {
    const pid = req.params.pid;

    // req.body가 빈 객체일 시 모든 데이터가 사라지니 주의!
    // => update() 메소드로 교체 필요 (키 삭제 문제 해결해야 함)
    admin.firestore().collection('babProfile').doc(pid).set(req.body)
    .then(() => {
        console.log('수정 성공');

        res.send({
            status: 200,
            message: '밥 프로필 수정 성공',
        });
    })
    .catch((error) => {
        console.error(error);
    });
});

router.delete('/:pid', (req, res, next) => {
    const pid = req.params.pid;

    admin.firestore().collection('babProfile').doc(pid).delete()
    .then(() => {
        console.log('삭제 성공');

        res.send({
            status: 200,
            message: '밥 프로필 삭제 성공',
        });
    })
    .catch((error) => {
        console.error(error);
    });
});

module.exports = router;
