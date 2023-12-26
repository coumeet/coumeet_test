const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
let session = require('express-session')
const { SolapiMessageService } = require('solapi');
const bcrypt = require('bcrypt');
const saltRounds = 10; // 솔트 라운드 수 (보안 강도 조절)
const messageService = new SolapiMessageService(process.env.SOLAPI_AUTH, process.env.SOLAPI_AUTH2);
const port = 3000;
const fs = require('fs');
const schedule = require('node-schedule');
require('dotenv').config();



// mysql 연동
const mysql = require('mysql');
const { restart } = require('nodemon');
const { captureRejectionSymbol } = require('events');
const connection = mysql.createConnection({
    host : process.env.DB_HOST, // 호스트 주소만 지정
    port : process.env.DB_PORT, // 포트 번호 지정
    user : process.env.DB_USER,
    password : process.env.DB_PW,
    database : 'users',
    charset: 'utf8',
});

// firebase 정보
const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: "phonecertification.firebaseapp.com",
  projectId: "phonecertification",
  storageBucket: "phonecertification.appspot.com",
  messagingSenderId: process.env.FIREBASE_MSGID,
  appId: process.env.FIREBASE_APPID,
  measurementId: process.env.FIREBASE_MEASUREID,
};

console.log('DB_HOST:',process.env.DB_HOST);
console.log('DB_PORT:',process.env.DB_PORT);
console.log('DB_USER:',process.env.DB_USER);
console.log('DB_PW:',process.env.DB_PW);
console.log('EMAIL_USER:',process.env.EMAIL_USER);
console.log('EMAIL_PASS:',process.env.EMAIL_PASS);
console.log('SOLAPI_AUTH:',process.env.SOLAPI_AUTH);
console.log('SOLAPI_AUTH2:',process.env.SOLAPI_AUTH2);
console.log('FIREBASE_APIKEY:',process.env.FIREBASE_APIKEY);
console.log('FIREBASE_MSGID:',process.env.FIREBASE_MSGID);
console.log('FIREBASE_APPID:',process.env.FIREBASE_APPID);
console.log('FIREBASE_MEASUREID:',process.env.FIREBASE_MEASUREID);

connection.connect();

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/backend/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json()); 

//세션 사용 시 미들웨어
app.use(session({
  secret: 'bumiscoming',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    // maxAge: 60000,
    secure: false }
}))

// 어디서든 변수를 쓸 수 있도록 지정
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8'); // 한글 설정
  next();
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // req.session.userId 사용하여 유저별 폴더 생성
    const userFolder = path.join('uploads/', req.body.id);

    // 폴더가 이미 존재하는지 확인
    if (!fs.existsSync(userFolder)) {
      // 폴더가 없다면 생성
      fs.mkdirSync(userFolder, { recursive: true });
    }

    // 유저별 폴더에 파일 저장
    cb(null, userFolder);
  },
  filename: function (req, file, cb) {

    // 한글 파일명 깨짐 해결
    file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
    
    // 파일명을 그대로 사용
    cb(null, file.originalname);
  }
});


// // 업로드된 파일을 저장할 디렉토리와 파일명 설정
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {

//     // req.session.userId 사용하여 유저별 폴더 생성
//     const userFolder = path.join('uploads/', req.body.id);

//     // 폴더가 이미 존재하는지 확인
//     if (!fs.existsSync(userFolder)) {
//       // 폴더가 없다면 생성
//       fs.mkdirSync(userFolder, { recursive: true });
//     }

//     // 유저별 폴더에 파일 저장
//     cb(null, userFolder);
//   },
//   filename: function (req, file, cb) {
//     // 확장자 추출
//     const ext = path.extname(file.originalname);
//     // const fileName = file.originalname;
//     const fileName = file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

//     // // 랜덤한 파일 이름 생성 (현재 시간을 기반으로)
//     // const randomFileName = Date.now() + '-' + Math.round(Math.random() * 1000);

//     // 최종 파일 이름 결정 (확장자를 그대로 유지)
//     cb(null, fileName);
//   }
// });

// 업로드 미들웨어 설정
const upload = multer({ storage: storage });

// Cron 표현식: 매일 자정 (0시 0분)
const cronExpression = '0 0 * * *';

// 스케줄러 생성
const job = schedule.scheduleJob(cronExpression, dailyTask);

// 서버 재시작 될 때마다 실행하기
dailyTask();

// 하루가 시작할 때 실행할 함수
async function dailyTask() {
  console.log('매일 자정에 실행됩니다.');
  let sql;
  let offerList;
  let matchingOfferType;
  // 매칭 신청 정보를 모두 확인하고
  sql = `SELECT * FROM users.matching WHERE result = 'offer'`;
  connection.query(sql, async (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      offerList = results;

      for (const offerContent of offerList) {
        const offerDate = new Date(offerContent.offer_date);
        const currentDate = new Date();
      
        // offer 날짜와 현재 날짜의 차이를 계산
        const timeDifference = offerDate - currentDate;
        
        // 차이를 밀리초(ms)에서 일(day)로 변환
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        
        // console.log(`offer 날짜: ${offerDate.toISOString().split('T')[0]}`);
        // console.log(`현재 날짜: ${currentDate.toISOString().split('T')[0]}`);
        // console.log(`날짜 차이: ${daysDifference}일`);
  
        if(daysDifference < -7) {
          // console.log('7일이 지났습니다');
          let sql;
          const offer_id = offerContent.offer_id;
          const receive_id = offerContent.receive_id;
          console.log('receive_id:',receive_id);

          // receive_id의 직업을 확인한다.
          async function fetchOccupation(receive_id) {
            return new Promise((resolve, reject) => {
              sql = `SELECT occupation FROM users.info WHERE id = '${receive_id}'`;
              connection.query(sql, (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results[0].occupation);
                }
              });
            });
          }

          const occupationOfReceive_id = await fetchOccupation(receive_id);
          console.log(`receive_id:${receive_id}, occupationOfReceive_id:${occupationOfReceive_id}`);

          if (occupationOfReceive_id === '일반 직업') {
            matchingOfferType = 'matchingOffer_normal';
          } else if (occupationOfReceive_id === '대기업' || occupationOfReceive_id === '공무원(6급 이하)' || occupationOfReceive_id === '공기업' || occupationOfReceive_id === '교직원') {
              matchingOfferType = 'matchingOffer_middle';
          } else if (occupationOfReceive_id === '전문직(변호사, 검판사 등)' || occupationOfReceive_id === '공무원(5급 이상)') {
              matchingOfferType = 'matchingOffer_high';
          }

          // offer_id의 성별, 포인트를 확인한다.
          async function fetchPointAndGenderFromOfferId(offer_id) {
            return new Promise((resolve, reject) => {
              sql = `SELECT gender, point FROM users.info WHERE id = '${offer_id}'`;
              connection.query(sql, (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  if (results.length === 0) {
                    reject("Data not found"); // 데이터를 찾지 못한 경우 거부
                  } else {
                    resolve({
                      gender: results[0].gender,
                      point: results[0].point
                    });
                  }
                }
              });
            });
          }

          const PointAndGenderFromOfferId = await fetchPointAndGenderFromOfferId(offer_id);
          const genderOfOffer_id = PointAndGenderFromOfferId.gender;
          let pointOfOffer_id = PointAndGenderFromOfferId.point;   

          // console.log(`genderOfOffer_id:${genderOfOffer_id}, ${pointOfOffer_id}`);
          
          
          // offer_id가 매칭 신청을 하는데 얼마를 지불했는지 알아야 한다.
          async function fetchPaymentPoint(matchingOfferType, genderOfOffer_id) {
            return new Promise((resolve, reject) => {
              sql = `SELECT ${matchingOfferType} FROM users.pointpolicy WHERE gender ='${genderOfOffer_id}'`;
              connection.query(sql, (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  let paymentPoint;
                  if(matchingOfferType === 'matchingOffer_normal') {
                    paymentPoint = results[0].matchingOffer_normal;
                  } else if(matchingOfferType === 'matchingOffer_middle') {
                    paymentPoint = results[0].matchingOffer_middle;
                  } else if(matchingOfferType === 'matchingOffer_high') {
                    paymentPoint = results[0].matchingOffer_high;
                  }
                  resolve(paymentPoint);
                }
              });
            });
          }

          const paymentPoint = await fetchPaymentPoint(matchingOfferType, genderOfOffer_id);
          // console.log('paymentPoint:',paymentPoint);

          // 지불한 만큼 pointusage history에 환급 표시를 한다.
          async function fetchUpdateUsageHistory(offer_id, receive_id, paymentPoint) {
            return new Promise((resolve, reject) => {
              const serialNumber = generateSerialNumber();
              sql = `INSERT INTO pointusage (id, type, method, matchingUser, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
              values = [offer_id, '환급', '매칭 취소', receive_id, paymentPoint, serialNumber];
              connection.query(sql, values,  (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            });
          }

          const fetchUpdateUsage = await fetchUpdateUsageHistory(offer_id, receive_id, paymentPoint);
          // console.log('fetchUpdateUsage:',fetchUpdateUsage.affectedRows);

          // users.matching에 있는 result를 canceled or open으로 변경한다.
          async function fetchOpenStatusCheck(offer_id, receive_id) {
            return new Promise((resolve, reject) => {
              sql = `SELECT * FROM users.matching WHERE offer_id = ? AND receive_id = ? AND open_date is NOT NULL AND result = 'offer'`;
              values = [offer_id, receive_id];
              connection.query(sql, values,  (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results[0]);
                }
              });
            });
          }

          const openStatus = await fetchOpenStatusCheck(offer_id, receive_id);
          // console.log('openStatus:',openStatus);

          // open 하지 않았을 경우(이용자 열람을 하지 않은 경우)
          if(openStatus === undefined) {
            async function fetchUpdateMatching(offer_id, receive_id) {
              return new Promise((resolve, reject) => {
                sql = `UPDATE users.matching SET result = 'canceled', cancel_date = NOW() WHERE offer_id = ? AND receive_id = ? AND result = 'offer'`;
                values = [offer_id, receive_id];
                connection.query(sql, values,  (err, results) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results[0]);
                  }
                });
              });
            }
            const updateMatching = await fetchUpdateMatching(offer_id, receive_id);
            // console.log('updateMatching:',updateMatching);
          } 
          // open을 했을 경우(이용자 열람을 했을 경우)
          else {
            async function fetchUpdateMatching(offer_id, receive_id) {
              return new Promise((resolve, reject) => {
                sql = `UPDATE users.matching SET result = 'open', cancel_date = NOW() WHERE offer_id = ? AND receive_id = ? AND result = 'offer'`;
                values = [offer_id, receive_id];
                connection.query(sql, values,  (err, results) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results[0]);
                  }
                });
              });
            }
            const updateMatching = await fetchUpdateMatching(offer_id, receive_id);
            // console.log('updateMatching:',updateMatching);
          } 

          // offer_id의 포인트를 환급한 총액으로 업데이트 한다.
          // console.log(`pointOfOffer_id:${pointOfOffer_id}`);
          pointOfOffer_id += paymentPoint;
          // console.log(`pointOfOffer_id:${pointOfOffer_id}`);
          async function fetchUpdatePoint(pointOfOffer_id, offer_id) {
            return new Promise((resolve, reject) => {
              sql = `UPDATE users.info SET point = ${pointOfOffer_id} WHERE id = '${offer_id}'`;
              values = [offer_id, receive_id];
              connection.query(sql, values,  (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results[0]);
                }
              });
            });
          }
          const updatePoint = await fetchUpdatePoint(pointOfOffer_id, offer_id);
          // console.log('updatePoint:',updatePoint);
        }
      }
    }
  });
}

app.get('/', (req, res) => {  
  res.sendFile(path.join(__dirname, '../frontend', 'matchinglist.html'));
});

app.get('/service', (req, res) => {  
  res.sendFile(path.join(__dirname, '../frontend', 'home.html'));
});

// 로그인 버튼 클릭 시
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

// FAQ 버튼 클릭 시
app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'faq.html'));
});

// AI매칭 버튼 클릭 시
app.get('/aimatching', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'aimatching.html'));
});

app.get('/agreement', (req, res) => {
  myprofileRecog = 'profile';
  res.sendFile(path.join(__dirname, '../frontend', 'agreement.html'));
});

app.post('/faqProc', (req, res) => {
  const sql = 'SELECT * FROM users.faq';
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      res.json(results);
    }
  });
});




let myprofileRecog = ''; // myprofile에서 왼쪽 메뉴에서 어떤 버튼을 눌렀는지 구분하는 Recog

app.get('/findInfo', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'find_logininfo.html'));
});

app.post('/findIdProc', (req, res) => {
  const nameValue = req.body.nameValue;
  const phoneValue = req.body.phoneValue;

  const sql = `SELECT id FROM users.info WHERE (name = '${nameValue}' AND phone = '${phoneValue}')`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      console.log('results:',results[0].id);
      const userId = results[0].id;
      console.log('userID:',userId);

      messageService.send({
        'to': phoneValue,
        'from': '01040718523',
        'text': `[COUMEET] 아이디(이메일)은 ${userId}입니다.`
      });

      res.send({result : 'SUCCESS'});
      
    } else {
      console.log('일치하는 정보가 없습니다');
      res.send({result : 'FAIL'});
    }
  });
});


// 마이프로필 or 마이프로필 > 프로필 관리 버튼 클릭 시
app.get('/myprofile/profile', (req, res) => {
  myprofileRecog = 'profile';
  res.sendFile(path.join(__dirname, '../frontend/myprofile', 'profile_management.html'));
});

// 마이프로필 > 포인트 관리 버튼 클릭 시
app.get('/myprofile/point', (req, res) => {
  myprofileRecog = 'point';
  res.sendFile(path.join(__dirname, '../frontend/myprofile', 'point_management.html'));
});

// 마이프로필 > 매너 후기 버튼 클릭 시
app.get('/myprofile/review', (req, res) => {
  myprofileRecog = 'review';
  res.sendFile(path.join(__dirname, '../frontend/myprofile', 'review.html'));
});

// 마이프로필 > 비밀번호 변경 버튼 클릭 시
app.get('/myprofile/changepw', (req, res) => {
  myprofileRecog = 'changepw';
  res.sendFile(path.join(__dirname, '../frontend/myprofile', 'changepw.html'));
});

app.post('/myprofile/leftmenuProc', (req, res) => {
  const sql = `SELECT picture_1, id FROM users.info WHERE id = '${req.session.userId}'`;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    if(results.length > 0) {
      const responseData = {
        data: results,
        myprofileRecog: myprofileRecog
      };
      res.json(responseData);
      // console.log('마이 프로필 > leftmenu 정보 전송 완료');
    } else {
      res.send( {result : 'fail to send info'});
    }
  });
});

// id의 포인트 값을 확인하여 클라이언트에 전달하기
app.post('/myprofile/userPointProc', (req, res) => {

  let sql = '';
  let pointUsages = '';
  sql = `SELECT point, signupStatus, eventPoint FROM users.info WHERE id = '${req.session.userId}'`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length>0) {
      const point = results[0].point;
      const signupStatus = results[0].signupStatus;
      const eventPoint = results[0].eventPoint;

      sql = `SELECT * FROM users.pointusage WHERE id = '${req.session.userId}' ORDER BY date DESC`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          pointUsages = results;
          res.json({ point, signupStatus, pointUsages, eventPoint});
        } else {
          pointUsages = undefined;
          res.json({ point, signupStatus, pointUsages, eventPoint});
        }
      });
    }
  });
});

// Navbar 로그인 상태 확인하기
app.post('/loginStatusProC', (req, res) => {

  // console.log(`req.session.userId:${req.session.userId}`);

  if(req.session.userId) {
    // 로그인했을 경우
    const sql = `SELECT picture_1, id, gender, signupConfirmdate, point, signupStatus, phone FROM users.info WHERE id = '${req.session.userId}'`;
    connection.query(sql, (err, results) => {
      if (err) throw err;
      if(results.length > 0) {
        res.json(results);
      } else {
        res.send( {result : 'Not Logged in'});
      }
    });
  } else {
    res.send({ result : 'Not Logged in'});
  }
});

// 회원 가입 시 이미 있는 정보인지 확인
app.post('/singupCheckProC', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const sql = `SELECT * FROM users.info WHERE phone = '${phoneNumber}'`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      res.send({result : 'EXIST'});
    } else {
      res.send({result : 'NO EXIST'});
    }
  });
});

// 이용자의 모든 정보를 요청 할 때 (Myprofile)
app.post('/userInfoRequestProC', (req, res) => { 
  const sql = `SELECT * FROM users.info WHERE id = '${req.session.userId}'`;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    if(results.length > 0) {
      res.json(results);
    } else {
      res.send( {result : 'no result'});
    }
  });
});

// 로그인 확인 요청이 들어올 때
app.post('/loginProc', (req, res) => {

    // 로그인 상태 변경
    // req.session.loginStatus = 'OFF';

    const id = req.body.id;
    const pw = req.body.pw;
    const autoLoginStatus = req.body.autoLoginStatus;

    console.log(`req.session.userId:${req.session.userId}`);

    //해시된 비밀 번호를 가져온다.
    let sql = `SELECT pw, pwcountfail FROM users.info WHERE id = ?`;
    let values = [id];
    let pwcountfail = 0;

    // let sql = `SELECT * FROM users.info WHERE id = ? AND pw = ?`;

    connection.query(sql, values, (err, results) => {

        // console.log(results);
        console.log('req.session.userId:',req.session.userId);

        if (err) throw err;
        // 결과 처리
        if (results.length > 0) {

          // 비밀번호 실패 처리를 위한 값을 받기
          if(results[0].pwcountfail === null) {
            results[0].pwcountfail = 0;
          } 
          else {
            pwcountfail = parseInt(results[0].pwcountfail);
          }

          bcrypt.compare(pw, results[0].pw, (err, result) => {

            if (err) {
              // 해시값 비교 중 오류 처리
              console.error(err);
            } 
            else if(pwcountfail >= 5) {
              console.log('비밀번호 5회 이상 실패');
              res.send({ result: 'pwcountfail too much' });
            }
            else if(result) {

              req.session.userId = req.body.id;
              // 비밀번호 일치
              res.send({ result: 'success' });
              pwcountfail = 0;

              // console.log('비밀번호 일치!');

              // 비밀번호 누적 카운트 초기화하기
              sql = `UPDATE users.info SET pwcountfail = ? WHERE id = ?`;
              values = [pwcountfail.toString(), id];

              connection.query(sql, values, (err, results) => {
                if(err) throw err;
                if(results.affectedRows) {
                  // console.log('pwcountfail update success');
                } else {
                  // console.log('pwcountfail update fail');
                }
              });

            } else {
                // 비밀번호 불일치
                res.send({ result: 'fail' });

                // console.log('비밀번호 불일치');

                // 비밀번호 누적 카운트 추가하기
                pwcountfail = pwcountfail + 1;
                sql = `UPDATE users.info SET pwcountfail = ? WHERE id = ?`;
                values = [pwcountfail.toString(), id];

                connection.query(sql, values, (err, results) => {
                  if(err) throw err;
                  if(results.affectedRows) {
                    console.log('pwcountfail update success');
                  } else {
                    console.log('pwcountfail update fail');
                  }
                });
            }
          });
        } else {
          // 아이디가 없는 경우
          console.log('일치하는 아이디가 없습니다');
          res.send({ result: 'id no exist' });
        }

        console.log('req.session.userId:',req.session.userId);

    });
});

// 찜한 이용자 리스트 요청
app.post('/favoriteListProc', (req, res) => {
  const id = req.session.userId // 찜한 이용자
  let sql = '';
  let values = [];

  sql = `SELECT * FROM users.favorite WHERE id = ?`;
  values = [id];

  connection.query(sql, values, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      // 리스트 존재할 경우 → 결과값 프론트에 전달
      res.json(results);
    } else {
      // 리스트가 존재하지 않을 경우
      res.send({ results : 'no list' });
    }
  });
});

// 찜하기(♥) 버튼 클릭하여 요청 시
app.post('/favoriteIconBtnProc', (req, res) => {
  const selectedId = req.body.selectedId; // 찜 받은 이용자
  const id = req.session.userId // 찜한 이용자
  let sql = '';
  let values = [];

  // 찜한 이용자가 찜 받은 이용자에 대해서 찜한 여부 확인
  sql = `SELECT * FROM users.favorite WHERE id = ? AND selectedId = ?`;
  values = [id, selectedId];

  connection.query(sql, values, (err, results) => {
    if(err) throw err;
    // 찜했을 경우 DELETE → result : delete 전달
    if(results.length > 0) {
      sql = `DELETE FROM users.favorite WHERE id = ? AND selectedId = ?;`
      values = [id, selectedId];
      connection.query(sql, values, (err, results) => {
        if(err) throw err;
        if(results.affectedRows) {
          res.send({ result: 'delete' });
        } else {
          console.log('favorite delte fail');
        }
      });
    } 
    // 찜하지 않았을 경우 INSERT → result : insert 전달
    else {
      sql = `INSERT INTO users.favorite (id, selectedId, actiondate) VALUES (?, ?, NOW())`;
      values = [id, selectedId];
      connection.query(sql, values, (err, results) => {
        if(err) throw err;
        if(results.affectedRows) {
          res.send({ result: 'insert' });
        } else {
          console.log('favorite insert fail');
        }
      });
    }
  });
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'signup.html'));
});

// 회원가입 정보 전달
app.post('/signupdataProc', async (req, res) => {

  async function fetchGetSignupData() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users.signupdata';
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          resolve(results);
        }
      });
    });
  } 

  const signupData = await fetchGetSignupData();
  // console.log('signupData:',signupData);

  async function fetchAreaData() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users.area';
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          resolve(results);
        }
      });
    });
  }

  const areaData = await fetchAreaData();
  // console.log('areaData:',areaData);

  async function fetchDatingStyleData() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users.datingstyle';
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          resolve(results);
        }
      });
    });
  }

  const datingStyleData = await fetchDatingStyleData();
  // console.log('datingStyleData:',datingStyleData);

  res.json({signupData, areaData, datingStyleData, firebaseConfig});

});

// 회원가입 버튼
app.post('/signupProc', upload.fields([
  { name: 'picture_1', maxCount: 1 }, // 'picture_1' 필드에서 1개의 파일 업로드
  { name: 'picture_2', maxCount: 1 }, // 'picture_2' 필드에서 1개의 파일 업로드
  { name: 'picture_3', maxCount: 1 },  // 'picture_3' 필드에서 1개의 파일 업로드
  { name: 'occupationFile', maxCount: 1 }  // 'picture_3' 필드에서 1개의 파일 업로드
]), (req, res) => {

  const id = req.body.id;
  // 사용자 비밀번호를 해시화하여 저장
  const plainPassword = req.body.pw;
  const name = req.body.name;
  const gender = req.body.gender;
  const nickname = req.body.nickname;
  const age = req.body.age;
  const height = req.body.height;
  const regionCity = req.body.regionCity;
  const regionGu = req.body.regionGu;
  const occupation = req.body.occupation;
  const occupationDetail = req.body.occupationDetail;
  const occupationFileName = req.body.occupationFileName;
  console.log('occupationFileName:',occupationFileName);
  // const occupationFile = req.files['occupationFile'][0].filename;
  let occupationFile = req.files['occupationFile'] !== undefined;
  console.log(`req.files['occupationFile']:${req.files['occupationFile']}`);
  if(occupationFile) {
    // occupationFile이 file 형태일 경우
    occupationFile = occupationFileName; // 파일 형태로 넘어올 경우에는 이름만 넣는다.
    console.log('occupationFileName:',occupationFileName);
  } else {
    occupationFile = req.body.occupationFile; // 이름 형태로 넘어올 경우에는 그대로 넣는다.
    console.log('req.body.occupationFile:',req.body.occupationFile);
  }
  // console.log('occupationFile:',occupationFile);
  const mbti = req.body.mbti;
  const style = req.body.style;
  const eyeType = req.body.eyeType;
  const bodyType = req.body.bodyType;
  const faceType = req.body.faceType;
  const lips = req.body.lips;
  const personality = req.body.personality;
  const drinking = req.body.drinking;
  const smoking = req.body.smoking;
  const religion = req.body.religion;
  const agePreference = req.body.agePreference;
  const relationship = req.body.relationship;
  const distance = req.body.distance;
  const pet = req.body.pet;
  const hobby = req.body.hobby;
  // const picture_1 = req.files['picture_1'][0].filename; // 'picture_1' 필드에서 업로드된 파일
  // const picture_2 = req.files['picture_2'][0].filename; // 'picture_2' 필드에서 업로드된 파일
  // const picture_3 = req.files['picture_3'][0].filename; // 'picture_3' 필드에서 업로드된 파일
  let picture_1 = req.files['picture_1'] !== undefined; // 'picture_1' 필드에서 업로드된 파일
  console.log(`picture_1:${picture_1}`);
  if(picture_1) {
    // picture_1이 file 형태일 경우
    console.log(`req.body.picture_1Name:${req.body.picture_1Name}`);
    if(req.body.picture_1Name === undefined) {
      picture_1 = req.files['picture_1'][0].filename; 
    } else {
      picture_1 = req.body.picture_1Name;
    }
  } else {
    // console.log(`req.body.picture_1:${req.body.picture_1}`);
    picture_1 = req.body.picture_1;
  }

  let picture_2 = req.files['picture_2'] !== undefined; // 'picture_2' 필드에서 업로드된 파일
  if(picture_2) {
    // picture_2이 file 형태일 경우
    if(req.body.picture_2Name === undefined) {
      picture_2 = req.files['picture_2'][0].filename;
    } else {
      picture_2 = req.body.picture_2Name;
    }
    // console.log(`req.body.picture_2Name:${req.body.picture_2Name}`);
  } else {
    picture_2 = req.body.picture_2;
  }

  let picture_3 = req.files['picture_3'] !== undefined; // 'picture_3' 필드에서 업로드된 파일
  if(picture_3) {
    // picture_3이 file 형태일 경우
    if(req.body.picture_3Name === undefined) {
      picture_3 = req.files['picture_3'][0].filename;
    } else {
      picture_3 = req.body.picture_3Name;
    }
    // console.log(`req.body.picture_3Name:${req.body.picture_3Name}`);
  } else {
    picture_3 = req.body.picture_3;
  }

  const salary = req.body.salary;
  const phone = req.body.phone;
  const contactTerms = req.body.contactTerms;
  const statusReport = req.body.statusReport;
  const datingCost = req.body.datingCost;
  const hobbyPreference = req.body.hobbyPreference;
  const datingStyles = req.body.datingStyles;
  const manner = req.body.manner;
  const datingTerm = req.body.datingTerm;
  const anniversary = req.body.anniversary;
  const contactPreference = req.body.contactPreference;
  const comfortStyle = req.body.comfortStyle;
  const letter = decodeURIComponent(req.body.letter);
  let signupStatus = req.body.signupStatus;
  const termsOfUseAgreement = req.body.termsOfUseAgreement;
  const privacyPolicyAgreement = req.body.privacyPolicyAgreement;
  const marketingAgreement = req.body.marketingAgreement;


  // 비밀번호가 없이 넘어왔을 경우
  if(plainPassword === undefined) {

    // console.log(`occupationFile:${occupationFile}`);

    if(signupStatus === 'REJECT') {
      signupStatus = 'WAITING';
    } 
    
    const sql = `UPDATE users.info
    SET name = ?, gender = ?, nickname = ?, age = ?, height = ?, regionCity = ?, regionGu = ?, occupation = ?, occupationDetail = ?, occupationFile = ?, mbti = ?, style = ?, eyeType = ?, bodyType = ?, faceType = ?, lips = ?, personality = ?, drinking = ?, smoking = ?, religion = ?, agePreference = ?, relationship = ?, distance = ?, pet = ?, hobby = ?, picture_1 = ?, picture_2 = ?, picture_3 = ?, salary = ?, phone = ?, contactTerms = ?, statusReport = ?, datingCost = ?, hobbyPreference = ?, datingStyles = ?, manner = ?, datingTerm = ?, anniversary = ?, contactPreference = ?, comfortStyle = ?, letter = ?, signupStatus = ?
    WHERE id = ?`;
    const values = [name, gender, nickname, age, height, regionCity, regionGu, occupation, occupationDetail, occupationFile, mbti, style, eyeType, bodyType, faceType, lips, personality, drinking, smoking, religion, agePreference, relationship, distance, pet, hobby, picture_1, picture_2, picture_3, salary, phone, contactTerms, statusReport, datingCost, hobbyPreference, datingStyles, manner, datingTerm, anniversary, contactPreference, comfortStyle, letter, signupStatus, id];
    // console.log(values);

    connection.query(sql, values, (err, results) => {

      // console.log(`results:${results}`);
      // console.log(results.affectedRows);

      if (err) throw err;
      // 결과 처리
      if (results.affectedRows > 0) {
        console.log('업데이트 완료');
        res.send({ result: 'success' });
      } else {
        console.log('업데이트 실패');
        res.send({ result: 'fail' });
      }
    });
  } 
  // 비밀번호가 함께 넘어왔을 경우
  else {
    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {

      if(err) {
        console.error(err);
      } else {
        // 이벤트 포인트 정보 받아오기
        const sql = `SELECT eventPoint FROM users.pointpolicy WHERE gender = '이벤트'`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            const eventPoint = results[0].eventPoint;

            // 이벤트 포인트가 있을 경우(0보다 큰 경우) pointusage에 충전 내역을 기록한다.
            if(eventPoint > 0) {
              const sql = `INSERT INTO users.pointusage (id, type, method, usagePoint, SN, date) VALUES (?, ?, ?,  ?, ?, NOW())`;
              const serialNumber = generateSerialNumber();
              const values = [id, '충전', '이벤트 포인트 지급', eventPoint, serialNumber];
              connection.query(sql, values, (err, results) => {
                if(err) throw err;
                if(results.affectedRows > 0) {
                  const sql = `INSERT INTO users.info (id, pw, name, gender, nickname, age, height, regionCity, regionGu, occupation, occupationDetail, occupationFile, mbti, style, eyeType, bodyType, faceType, lips, personality, drinking, smoking, religion, agePreference, relationship, distance, pet, hobby, picture_1, picture_2, picture_3, salary, phone, contactTerms, statusReport, datingCost, hobbyPreference, datingStyles, manner, datingTerm, anniversary, contactPreference, comfortStyle, letter, signupdate, point, signupStatus, termsofuseAgreement, privacypolicyAgreement, marketingAgreement, eventPoint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'WAITING', ?, ?, ?, ?)`;
                  const values = [id, hash, name, gender, nickname, age, height, regionCity, regionGu, occupation, occupationDetail, occupationFile, mbti, style, eyeType, bodyType, faceType, lips, personality, drinking, smoking, religion, agePreference, relationship, distance, pet, hobby, picture_1, picture_2, picture_3, salary, phone, contactTerms, statusReport, datingCost, hobbyPreference, datingStyles, manner, datingTerm, anniversary, contactPreference, comfortStyle, letter, eventPoint, termsOfUseAgreement, privacyPolicyAgreement, marketingAgreement, eventPoint];
                  // console.log(values);
            
                  connection.query(sql, values, (err, results) => {
            
                    // console.log(`results:${results}`);
                    // console.log(results.affectedRows);
              
                    if (err) throw err;
                    // 결과 처리
                    if (results.affectedRows > 0) {
                      console.log('회원가입 완료');
                      res.send({ result: 'success' });
                    } else {
                      console.log('회원가입 실패');
                      res.send({ result: 'fail' });
                    }
                  });
                }
              });
            } 
            // 이벤트 포인트가 없을 경우
            else {
              const sql = `INSERT INTO users.info (id, pw, name, gender, nickname, age, height, regionCity, regionGu, occupation, occupationDetail, occupationFile, mbti, style, eyeType, bodyType, faceType, lips, personality, drinking, smoking, religion, agePreference, relationship, distance, pet, hobby, picture_1, picture_2, picture_3, salary, phone, contactTerms, statusReport, datingCost, hobbyPreference, datingStyles, manner, datingTerm, anniversary, contactPreference, comfortStyle, letter, signupdate, point, signupStatus, termsofuseAgreement, privacypolicyAgreement, marketingAgreement, eventPoint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'WAITING', ?, ?, ?, ?)`;
              const values = [id, hash, name, gender, nickname, age, height, regionCity, regionGu, occupation, occupationDetail, occupationFile, mbti, style, eyeType, bodyType, faceType, lips, personality, drinking, smoking, religion, agePreference, relationship, distance, pet, hobby, picture_1, picture_2, picture_3, salary, phone, contactTerms, statusReport, datingCost, hobbyPreference, datingStyles, manner, datingTerm, anniversary, contactPreference, comfortStyle, letter, eventPoint, termsOfUseAgreement, privacyPolicyAgreement, marketingAgreement, eventPoint];
              // console.log(values);
        
              connection.query(sql, values, (err, results) => {
        
                // console.log(`results:${results}`);
                // console.log(results.affectedRows);
          
                if (err) throw err;
                // 결과 처리
                if (results.affectedRows > 0) {
                  console.log('회원가입 완료');
                  res.send({ result: 'success' });
                } else {
                  console.log('회원가입 실패');
                  res.send({ result: 'fail' });
                }
              });
            }
          }
        })
      }
    });
  }
});

//아이디 중복 확인 버튼
app.post('/idcheck', (req, res) => {
    const id = req.body.id;

    let sql = `SELECT * FROM users.info WHERE id = ?`;
    const values = id;

    connection.query(sql, values, (err, results) => {

        console.log(results);

        if (err) throw err;
        // 결과 처리
        if (results.length > 0) {
          console.log('일치하는 값이 존재합니다.');
          res.send({ result: 'confirm' });
        } else {
          console.log('일치하는 값이 존재하지 않습니다.');
          res.send({ result: 'no_match' });
        }
    });
});

//닉네임 중복 확인 버튼
app.post('/nickNamecheck', (req, res) => {
  const nickname = req.body.nickname;

  let sql = `SELECT * FROM users.info WHERE nickname = ?`;
  const values = nickname;

  connection.query(sql, values, (err, results) => {

      console.log(results);

      if (err) throw err;
      // 결과 처리
      if (results.length > 0) {
        console.log('일치하는 값이 존재합니다.');
        res.send({ result: 'confirm' });
      } else {
        console.log('일치하는 값이 존재하지 않습니다.');
        res.send({ result: 'no_match' });
      }
  });
});

app.get('/findpw', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'findpw.html'));
});

// 비밀번호 찾기 전송 버튼
app.post('/findPwProc', (req, res) => {
  const email = req.body.idValue;
  const authNumber = generateRandomCode();
  let values;

  console.log('email:',email);
  console.log('authNumber:',authNumber);

  let sql = `SELECT * FROM users.info WHERE id = '${email}'`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {

      // 이메일 보내기
      sendEmailForChangePw(email, authNumber)
      .then(() => {
        res.send({result : 'SUCESS', authNumber: authNumber});
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({result : 'FAIL'});
      });
    } else {
      res.send({result : 'NO EXIST EMAIL'});
    }
  });
});

app.post('/authNumberProc', (req, res) => {
  const email = req.body.emailValue;
  const authNumber = generateRandomCode();
  console.log(`email:${email}`);
  console.log(`authNumber:${authNumber}`);

  // 이메일 보내기
  sendEmailForSignupEmail(email, authNumber)
  .then(() => {
    res.send({authNumber: authNumber});
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send({result : 'FAIL'});
  })
});

// 비밀번호 찾기를 위한 이메일 보내기 함수
async function sendEmailForChangePw(email, authNumber) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail 이용
    auth: {
      user: process.env.EMAIL_USER, // 보내는 이메일 주소
      pass: process.env.EMAIL_PASS, // 보내는 이메일의 비밀번호
    },
  });

  const mailOptions = {
    from: 'coumeetservice@gmail.com', // 보내는 이메일 주소
    to: email, // 받는 이메일 주소
    subject: '[COUMEET] 비밀번호 변경을 위한 인증번호 전달', // 이메일 제목
    text: `인증번호: ${authNumber} \n비밀번호 찾기 인증번호 입력 창에 위 인증번호를 입력해주세요`, // 이메일 내용
  };

  return transporter.sendMail(mailOptions);
}

// 회원가입 이메일 인증을 위한 이메일 보내기 함수
async function sendEmailForSignupEmail(email, authNumber) {

  const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail 이용
    auth: {
      user: process.env.EMAIL_USER, // 보내는 이메일 주소
      pass: process.env.EMAIL_PASS, // 보내는 이메일의 비밀번호
    },
  });

  const mailOptions = {
    from: 'coumeetservice@gmail.com', // 보내는 이메일 주소
    to: email, // 받는 이메일 주소
    subject: '[COUMEET] 회원 가입을 위한 인증번호 전달', // 이메일 제목
    text: `인증번호: ${authNumber} \n회원가입 아이디 인증번호 입력 창에 위 인증번호를 입력해주세요`, // 이메일 내용
  };

  return transporter.sendMail(mailOptions);
}

function generateRandomCode() {
  // 랜덤한 5자리 숫자 생성
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  return randomCode.toString(); // 문자열로 변환하여 반환
}

app.post('/myprofile/changepwProc', (req, res) => {
  let sql;
  let currentPwValue;
  let idValue;
  const changePwValue = req.body.changePwValue;


  if(req.body.idValue) {
    idValue = req.body.idValue;
  }

  if(req.body.currentPwValue) {
    currentPwValue = req.body.currentPwValue;

    //해시된 비밀 번호를 가져오기
    sql = `SELECT pw, pwcountfail FROM users.info WHERE id = '${req.session.userId}'`;
    connection.query(sql, (err, results) => {
      if(err) throw err;
      if(results.length > 0) {
        bcrypt.compare(currentPwValue, results[0].pw, (err,results) => {
          // 입력한 비밀번호 일치
          if(err) {
            console.error(err);
          }
          else if(results) {
            // 새 비밀번호로 변경하기
            bcrypt.hash(changePwValue, saltRounds, (err, hash) => {
              if(err) {
                console.error(err);
              } else { 
                sql = `UPDATE users.info SET pw = '${hash}', pwcountfail = '0' WHERE id = '${req.session.userId}'`;
                connection.query(sql, (err, results) => {
                  if(err) throw err;
                  if(results.affectedRows > 0) {
                    req.session.userId = undefined;
                    res.send({result : 'SUCCESS'});
                  } else {
                    res.send({result : 'FAIL'});
                  }
                });
              }
            });
          }
          // 비밀번호가 일치하지 않을 경우
          else {
            res.send({result : 'CURRENT PW NOT MATCH'})
          }
        });
      }
    });
  } else {
    // 새 비밀번호로 변경하기
    bcrypt.hash(changePwValue, saltRounds, (err, hash) => {
      if(err) {
        console.error(err);
      } else { 
        sql = `UPDATE users.info SET pw = '${hash}', pwcountfail = '0' WHERE id = '${idValue}'`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.affectedRows > 0) {
            res.send({result : 'SUCCESS'});
          } else {
            res.send({result : 'FAIL'});
          }
        });
      }
    });
  }
});

// 회원탈퇴 페이지
app.get('/myprofile/withdraw', (req, res) => {
  myprofileRecog = 'withdraw';
  res.sendFile(path.join(__dirname, '../frontend/myprofile', 'withdraw.html'));
});

// 회원탈퇴 프로세스 진행
app.post('/myprofile/withdrawProc', (req, res) => {
  let sql;
  const id = req.session.userId;
  //favorite에서 id를 기준으로 삭제
  sql = `DELETE FROM users.favorite WHERE (id = '${id}' OR selectedId = '${id}')`;
  connection.query(sql, async (err, results) => {
    if(err) throw err;
    if(results.affectedRows > 0) {
      console.log('DELETE FAVORITE LIST FROM ID');
    } else {
      console.log('THERE IS NOTHING LIST IN THE TABLE');
    }

    //pointusage에서 id를 기준으로 삭제
    async function fetchDeletePointUsage(id) {
      return new Promise((resolve, reject) => {
        sql = `DELETE FROM users.pointusage WHERE id = '${id}'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const deletePointUsage = await fetchDeletePointUsage(id);
    console.log('deletePointUsage:',deletePointUsage);

    //reporthistory에서 reporter, matchingUser를 기준으로 모두 삭제
    async function fetchDeleteReportHistory(id) {
      return new Promise((resolve, reject) => {
        sql = `DELETE FROM users.reporthistory WHERE (reporter = '${id}' OR matchingUser = '${id}')`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const deleteReportHistory = await fetchDeleteReportHistory(id);
    console.log('deleteReportHistory:',deleteReportHistory);

    //reviewhistory에서 matchingUser를 기준으로 삭제
    async function fetchDeleteReviewHistory(id) {
      return new Promise((resolve, reject) => {
        sql = `DELETE FROM users.reviewhistory WHERE matchingUser = '${id}'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const deleteReviewHistory = await fetchDeleteReviewHistory(id);
    console.log('deleteReviewHistory:',deleteReviewHistory);

    //pointrefund에서 id를 기준으로 삭제
    async function fetchDeletePointRefund(id) {
      return new Promise((resolve, reject) => {
        sql = `DELETE FROM users.pointrefund WHERE id = '${id}'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const deletePointRefund = await fetchDeletePointRefund(id);
    console.log('deletePointRefund:',deletePointRefund);

    //matching에서 offer_id를 기준으로 모두 삭제
    async function fetchDeleteMatchingByOfferId(id) {
      return new Promise((resolve, reject) => {
        sql = `DELETE FROM users.matching WHERE offer_id = '${id}'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const deleteMatchingByOfferId = await fetchDeleteMatchingByOfferId(id);
    console.log('deleteMatchingByOfferId:',deleteMatchingByOfferId);

    //matching에서 receive_id를 기준으로 offer_id한 사람은 포인트를 환급해주기
    //recive_id의 성별과 직업을 확인한다.
    async function fetchFindGenderAndOccupationFromId(id) {
      return new Promise((resolve, reject) => {
        sql = `SELECT gender, occupation FROM users.info WHERE id = '${id}'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve({
              gender: results[0].gender,
              occupation: results[0].occupation,
            });
          }
        });
      });
    }
    const genderAndOccupationFromIds = await fetchFindGenderAndOccupationFromId(id);
    let genderOfId = genderAndOccupationFromIds.gender;
    if(genderOfId === '남자') {
      genderOfId = '여자';
    } else {
      genderOfId = '남자';
    }
    const occupationOfId = genderAndOccupationFromIds.occupation
    console.log('genderOfId:',genderOfId);
    console.log('occupationOfId:',occupationOfId);
    
    let matchingOfferType;
    if (occupationOfId === '일반 직업') {
      matchingOfferType = 'matchingOffer_normal';
    } else if (occupationOfId === '대기업' || occupationOfId === '공무원(6급 이하)' || occupationOfId === '공기업' || occupationOfId === '교직원') {
        matchingOfferType = 'matchingOffer_middle';
    } else if (occupationOfId === '전문직(변호사, 검판사 등)' || occupationOfId === '공무원(5급 이상)') {
        matchingOfferType = 'matchingOffer_high';
    }
    console.log('matchingOfferType:',matchingOfferType);

    // recive_id에게 매칭을 신청하는데 사용하는 포인트를 확인한다.
    async function fetchPaymentPoint(matchingOfferType, genderOfId) {
      return new Promise((resolve, reject) => {
        sql = `SELECT ${matchingOfferType} FROM users.pointpolicy WHERE gender ='${genderOfId}'`;
        connection.query(sql, (err, results) => {
          if (err) {
            reject(err);
          } else {
            let paymentPoint;
            if(matchingOfferType === 'matchingOffer_normal') {
              paymentPoint = results[0].matchingOffer_normal;
            } else if(matchingOfferType === 'matchingOffer_middle') {
              paymentPoint = results[0].matchingOffer_middle;
            } else if(matchingOfferType === 'matchingOffer_high') {
              paymentPoint = results[0].matchingOffer_high;
            }
            // console.log('paymentPoint:',paymentPoint);
            resolve(paymentPoint);
          }
        });
      });
    }

    const paymentPoint = await fetchPaymentPoint(matchingOfferType, genderOfId);
    console.log('paymentPoint:',paymentPoint);


    //receive_id를 기준으로 offer_id한 사람의 리스트와 정보를 받는다
    async function fetchFindOfferIdMatchingByReceiveId(id) {
      return new Promise((resolve, reject) => {
        sql = `SELECT offer_id FROM users.matching WHERE receive_id = '${id}' AND result = 'offer'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const offerIds = await fetchFindOfferIdMatchingByReceiveId(id);
    const offerIdArray = offerIds.map(row => row.offer_id);
    console.log('offerIdArray:',offerIdArray);

    for(const offerId of offerIdArray) {
      console.log('offerId:',offerId);
      // offerId의 포인트 값을 받는다
      async function fetchGetUserPoint(offerId) {
        return new Promise((resolve, reject) => {
          sql = `SELECT point FROM users.info WHERE id = '${offerId}'`;
          connection.query(sql, (err, results) => {
            if(err) {
              reject(err);
            } else {
              console.log('results:', results[0]);
              resolve(results[0]);
            }
          });
        });
      }

      let userPoint = await fetchGetUserPoint(offerId);
      console.log('userPoint:',userPoint.point);  
      // offerId의 포인트를 환급해준다
      let updatedUserPoint = userPoint.point + paymentPoint;
      console.log('userPoint:',userPoint);  
      async function fetchRefundUserPoint(userPoint, offerId) {
        return new Promise((resolve, reject) => {
          sql = `UPDATE users.info SET point = ${updatedUserPoint} WHERE id = '${offerId}'`;
          connection.query(sql, (err, results) => {
            if(err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
      }

      const refundUserPoint = await fetchRefundUserPoint(userPoint, offerId);
      console.log('refundUserPoint:',refundUserPoint);

      // poinstUsage의 기록한다.
      async function fetchInsertPointUsage(paymentPoint, offerId, id) {
        return new Promise((resolve, reject) => {
          sql = `INSERT INTO users.pointusage (id, type, method, matchingUser, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
          const serialNumber = generateSerialNumber();
          const values = [offerId, '환급', '매칭 취소(상대 회원 탈퇴)', id, paymentPoint, serialNumber];
          connection.query(sql, values, (err, results) => {
            if(err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
      }

      const insertPointUsage = await fetchInsertPointUsage(paymentPoint, offerId, id);
      console.log('insertPointUsage:',insertPointUsage);

      // 매칭 기록 지우기
      async function fetchDeleteMatching(offerId, id) {
        return new Promise((resolve, reject) => {
          sql = `DELETE FROM users.matching WHERE (offer_id = '${offerId}' AND receive_id = '${id}')`;
          connection.query(sql, (err, results) => {
            if(err) {
              reject(err);
            } else {
              resolve(results);
            }
          })
        })
      }
    }

    //남은 매칭리스트 제거하기
    async function fetchDeleteMatchingByReceiveId(id) {
      return new Promise((resolve, reject) => {
        sql = `DELETE FROM users.matching WHERE receive_id = '${id}'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const deleteMatchingByReceiveId = await fetchDeleteMatchingByReceiveId(id);
    console.log('deleteMatchingByReceiveId:',deleteMatchingByReceiveId);

    //info에서 id를 기준으로 signupStatus를 WITHDRAW로 변경
    async function fetchDeleteInfoById(id) {
      return new Promise((resolve, reject) => {
        sql = `DELETE FROM users.info WHERE id = '${id}'`;
        connection.query(sql, (err, results) => {
          if(err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    const deleteInfoById = await fetchDeleteInfoById(id);

    //관련 폴더 삭제하기
    const userFolderPath = path.join(__dirname, 'uploads', `${id}`);
    fs.rmdir(userFolderPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error deleting user folder:', err);
      } else {
        console.log('User folder deleted successfully.');
      }
    })
  });

  req.session.userId = undefined;
  res.send({result : 'SUCCESS'});

});

//아이디 중복 확인 버튼
app.post('/changpwProc', (req, res) => {
  const pw = req.body.pw;
  const id = req.body.id;

  let sql = `UPDATE users.info SET pw = ? WHERE id = ?`;
  const values = [pw, id];

  connection.query(sql, values, (err, results) => {

    // console.log(results.length);

      if (err) throw err;
      // 결과 처리
      if (results.affectedRows > 0) {
        console.log('일치하는 값이 존재합니다.');
        res.send({ result: 'success' });
      } else {
        console.log('일치하는 값이 존재하지 않습니다.');
        res.send({ result: 'fail' });
      }
  });
});

app.get('/mainProc', (req, res) => {

  const id = req.session.userId; 

  let sql = `SELECT * FROM users.info WHERE id = ?`;
  const values = id;

  connection.query(sql, values, (err, results) => {

      if (err) throw err;
      // 결과 처리
      if (results.length > 0) {
        res.json(results[0]);
        
      } else {
        console.log('일치하는 값이 존재하지 않습니다.');
      }
  });
});

app.post('/mainProcUserListssss', (req, res) => {

  let sql = '';
  let values = [];
  
  const id = req.session.userId; 
  const category = req.body.category;
  let region = '';
  let height = '';
  let mbti = '';
  let occupation = '';


  // 아이디에 대한 정보를 받기
  sql = `SELECT * FROM users.info WHERE id = ?`;
  values = [id];

  connection.query(sql, values, (err, results) => {
    // console.log(results);
    if (err) throw err;

    if(results.length > 0) {

    // 결과 처리
    region = results[0].region;
    height = results[0].height;
    mbti = results[0].mbti;
    occupation = results[0].occupation;

    // 프론트로 내용 전달
    if(category == 'recent'){
      sql = `SELECT * FROM users.info WHERE id NOT IN (?);`;
      values = [[id]];
    } else if(category == 'region'){
      sql = `SELECT * FROM users.info WHERE region = ? AND id != ?`;
      values = [region, id];
    } else if(category == 'height'){
      sql = `SELECT * FROM users.info WHERE height = ? AND id != ?`;
      values = [height, id];
    } else if(category == 'mbti'){
      sql = `SELECT * FROM users.info WHERE mbti = ? AND id != ?`;
      values = [mbti, id];
    } else if(category == 'occupation'){
      sql = `SELECT * FROM users.info WHERE mbti = ? AND id != ?`;
      values = [occupation, id];
    } 
    
    connection.query(sql, values, (err, results) => {
  
      if (err) throw err;
      // 결과 처리
      if (results.length > 0) {

      // 1. list할 아이디 값만 추출함
      let listIds = results.map((row) => row.id);
      console.log(`listIds : ${listIds}`);

      // 2. 아이디의 매칭과 관련된 모든 List를 불러온다.
      sql = `
      SELECT * FROM users.matching
      WHERE (offer_id = ? OR receive_id = ?)
      `;
      values = [id, id];

      connection.query(sql, values, (err, results) => {

        // 3. 매칭된 List와 불러온 List를 비교해서 매칭 이력이 있는 id는 제외 한다
        results.forEach((row) => {
          const indexToRemoveReceive = listIds.indexOf(row.receive_id);
          if (indexToRemoveReceive !== -1) {
            console.log(`row.receive_id : ${row.receive_id}, listIds: ${listIds}`);
            listIds.splice(indexToRemoveReceive, 1);
          }
        
          const indexToRemoveOffer = listIds.indexOf(row.offer_id);
          if (indexToRemoveOffer !== -1) {
            console.log(`row.offer_id : ${row.offer_id}, listIds: ${listIds}`);
            listIds.splice(indexToRemoveOffer, 1);
          }
        });

        if (err) throw err;

        if(listIds == "") {
          console.log(`finalIds : ${listIds}`);
          res.send({ result: 'undifined' });
        } else {

          // 4. 최종 결과물을 list 한다.
          console.log(`finalIds : ${listIds}`);
          sql = `SELECT * FROM users.info WHERE id IN (?)`
          values = [listIds];

          connection.query(sql, values, (err, results) => {
            if (err) throw err;
            // 결과 처리
            if (results.length > 0) {
              res.json(results);
            } else {
              res.send({ result: 'undefined' });
            }
          }); 
        }  
      });
    } else {
        res.send({ result: 'undifined' });
    }
  });
    } else {
    console.log('일치하는 값이 존재하지 않습니다.');
  }
  });
});

// 유저 리스트 불러오기
app.post('/userListProc', (req, res) => {

  const id = req.session.userId // 찜한 이용자
  let sql = '';
  const totalFavoriteRecog = req.body.totalFavoriteRecog;

  // 비회원일 경우
  if(!req.session.userId) {
    userListHandler(req, res);
  }
  // 회원일경우 
  else {
    // '전체' 버튼 선택의 경우
    if(totalFavoriteRecog === 'total') {
      sql = `SELECT gender FROM users.info WHERE id = '${req.session.userId}'`;
      connection.query(sql, (err,results) => {
        if (err) throw err;
        if (results.length > 0) {
          userListHandler(req, res, results[0].gender);
        } 
      });
    } 
    // '찜한 사람' 버튼 선택의 경우
    else if(totalFavoriteRecog === 'favorite') {
      sql = `SELECT * FROM users.favorite WHERE id = ?`;
      values = [id];
    
      connection.query(sql, values, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          let favoriteUserList = [];
          results.forEach((results) => {
            favoriteUserList.push(`'${results.selectedId}'`);
          });
          // console.log(`favoriteUserList:${favoriteUserList}`);
          // console.log(`results[0].gender:${results[0].gender}`);
          userListHandler(req, res, results[0].gender, favoriteUserList);
        } else {
          // 리스트가 존재하지 않을 경우
          res.send({ result: 'no favorite list' });
        }
      });
    }
  }
});

function userListHandler(req, res, gender, favoriteUserList) {
  
  // console.log(`gender:${gender}`);

  const totalFavoriteRecog = req.body.totalFavoriteRecog;
  const id = req.session.userId;

  let sql = '';
  let values = [];

  let ageCategoryBtn = req.body.ageCategoryBtn;
  let heightCategoryBtn = req.body.heightCategoryBtn;
  const regionCategoryBtn = req.body.regionCategoryBtn;
  const occupationCategoryBtn = req.body.occupationCategoryBtn;
  const mbtiCategoryBtn = req.body.mbtiCategoryBtn;
  const styleCategoryBtn = req.body.styleCategoryBtn;
  const bodyTypeCategoryBtn = req.body.bodyTypeCategoryBtn;
  const personalityCategoryBtn = req.body.personalityCategoryBtn;
  const drinkingCategoryBtn = req.body.drinkingCategoryBtn;
  const hobbyCategoryBtn = req.body.hobbyCategoryBtn;
  const smokingCategoryBtn = req.body.smokingCategoryBtn;
  let genderValue = '';

  let ageSql = '';
  let heightSql = '';
  let regionSql = '';
  let occupationSql = '';
  let mbtiSql = '';
  let styleSql = '';
  let bodyTypeSql = '';
  let personalitySql = '';
  let drinkingSql = '';
  let hobbySql = '';
  let loginSql = '';
  let smokingSql = '';

  // 어떠한 필터도 선택하지 않았을 경우
  if (ageCategoryBtn.length === 0 && heightCategoryBtn.length === 0 && regionCategoryBtn.length === 0 && smokingCategoryBtn.length === 0 && mbtiCategoryBtn.length === 0 && styleCategoryBtn.length === 0 && bodyTypeCategoryBtn.length === 0 && personalityCategoryBtn.length === 0 && drinkingCategoryBtn.length === 0 && hobbyCategoryBtn.length === 0) {
  
    // 모든 변수가 비어있는 경우
    // console.log('모든 변수가 비어있습니다.');

    // 로그인 상태일 경우
    if(req.session.userId) {
      // '전체' 버튼을 선택 한 경우
      if(totalFavoriteRecog === 'total') {
        loginSql = `id != '${req.session.userId}' AND gender != '${gender}'`;
        sql = `SELECT * FROM users.info WHERE ${loginSql} AND signupConfirmdate IS NOT NULL ORDER BY idinfo DESC`;
      } 
      // '찜한 사람' 버튼을 선택한 경우
      else if(totalFavoriteRecog === 'favorite') {
        loginSql = `id IN (${favoriteUserList})`;
        sql = `SELECT * FROM users.info WHERE ${loginSql} AND signupConfirmdate IS NOT NULL ORDER BY idinfo DESC`;
      }
    } 
    // 비로그인 상태 일 경우
    else {
      sql = `SELECT * FROM users.info WHERE signupConfirmdate IS NOT NULL ORDER BY idinfo DESC`;      
    }

    connection.query(sql, (err,results) => {
      if (err) throw err;
      if (results.length > 0) {
        // console.log(results);
        res.json(results); // 결과값 프론트로 전송하기
      } else {
        res.send({ result: 'undifined' });
      }
    });
  } else {
    // 하나 이상의 변수가 값이 채워져 있는 경우
    console.log('하나 이상의 변수가 값이 채워져 있습니다.');

    // 변수가 나이 일 경우
    if(ageCategoryBtn.length > 0) {
      console.log(`ageCategoryBtn:${ageCategoryBtn}`);

      // 최소 나이와 최대 나이 초기화
      let minAge = Infinity;
      let maxAge = -Infinity;

      // ageCategoryBtn 배열을 순회하면서 최소 나이와 최대 나이 추출
      for (const category of ageCategoryBtn) {
        console.log(`category:${category}`);
        if(category === '50세 이상') {
          maxAge = 100;
          if(minAge === Infinity) {
            minAge = 50;
          }

        } else {
          const ageRange = category.split("~");
          if (ageRange.length === 2) {
            const startAge = parseInt(ageRange[0]);
            const endAge = parseInt(ageRange[1].replace("세", ""));
            
            // 최소 나이와 최대 나이 갱신
            if (startAge < minAge) {
              minAge = startAge;
            }
            if (endAge > maxAge) {
              maxAge = endAge;
            }
          }
        }
      }
      // 필터를 선택했을 경우
      ageSql = `age >= ${minAge} AND age <= ${maxAge}` ;
    } 

    // 변수가 키 일경우
    if (heightCategoryBtn.length > 0) {
      // console.log(`heightCategoryBtn:${heightCategoryBtn}`);

      // 최소와 최대 값을 추출하기 위한 초기값 설정
      var minHeight = Infinity;
      var maxHeight = -Infinity;

      // 각 범위를 반복하여 최소와 최대 값을 찾음
      for (var i = 0; i < heightCategoryBtn.length; i++) {

          // 범위에서 숫자 부분만 추출
          var range = heightCategoryBtn[i].match(/\d+/g);
          
          if (range) {

            // 149cm 이하일 경우
            if(range[0] === '149') {
              console.log(`149cm 이하!`);
              range[0] = '0';
              range[1] = '149';
            }

            // 190cm 이상일 경우
            if(range[0] === '190') {
              console.log(`190cm 이상!`);
              range[0] = '190';
              range[1] = '300';
            }

            // 추출된 숫자 중 최소값을 찾음
            var min = parseInt(range[0]);
            if (min < minHeight) {
                minHeight = min;
                console.log(`minHeight:${minHeight}`);
            }

            // 추출된 숫자 중 최대값을 찾음
            var max = parseInt(range[1]);
            if (max > maxHeight) {
                maxHeight = max;
            }
          }
      }
      // 필터를 선택했을 경우
      heightSql = `height >= ${minHeight} AND height <= ${maxHeight}` ;
    }

    // 변수가 사는곳 일 경우
    if(regionCategoryBtn.length > 0) {
      const reigionCityString = "'" + regionCategoryBtn.join("', '") + "'";
      regionSql = `regionCity IN (${reigionCityString})`;
    }

    // 변수가 MBTI 일 경우
    if(mbtiCategoryBtn.length > 0) {
      const mbtiString = "'" + mbtiCategoryBtn.join("', '") + "'";
      mbtiSql = `mbti IN (${mbtiString})`;
    }

    // 변수가 스타일 일 경우
    if(styleCategoryBtn.length > 0) {
      styleCategoryBtn.forEach((category, index) => {
        if (index > 0) {
          styleSql += " AND ";
        }
        styleSql += `style LIKE '%${category}%'`;
      });
    }

    // 변수가 체형 일 경우
    if(bodyTypeCategoryBtn.length > 0) {
      const bodyTypeString = "'" + bodyTypeCategoryBtn.join("', '") + "'";
      bodyTypeSql = `bodyType IN (${bodyTypeString})`;
    }

    // 변수가 성격 일 경우
    if(personalityCategoryBtn.length > 0) {
      personalityCategoryBtn.forEach((category, index) => {
        if (index > 0) {
          personalitySql += " AND ";
        }
        personalitySql += `personality LIKE '%${category}%'`;
      });
    }

    // 변수가 음주 일 경우
    if(drinkingCategoryBtn.length > 0) {
      const drinkingString = "'" + drinkingCategoryBtn.join("', '") + "'";
      drinkingSql = `drinking IN (${drinkingString})`;
    }

    // 변수가 흡연 일 경우
    if(smokingCategoryBtn.length > 0) {
      const smokingString = "'" + smokingCategoryBtn.join("', '") + "'";
      smokingSql = `smoking IN (${smokingString})`;     
    }

    // 변수가 취미 일 경우
    if(hobbyCategoryBtn.length > 0) {
      hobbyCategoryBtn.forEach((category, index) => {
        if (index > 0) {
          hobbySql += " AND ";
        }
        hobbySql += `hobby LIKE '%${category}%'`;
      });
    }

    // 로그인 상태일 경우
    if(req.session.userId) {
      // '전체' 버튼을 선택했을 경우
      if(totalFavoriteRecog === 'total') {
        loginSql = `id != '${req.session.userId}' AND gender != '${gender}'`;
      } 
      // '찜한 사람' 버튼을 선택했을 경우
      else if(totalFavoriteRecog === 'favorite') {
        loginSql = `id IN (${favoriteUserList})`;
      }
    }

    const conditions = [
      ageSql,
      heightSql,
      regionSql,
      mbtiSql,
      styleSql,
      bodyTypeSql,
      personalitySql,
      drinkingSql,
      hobbySql,
      loginSql,
      smokingSql,
    ];

    // 값이 있는 조건만 필터링
    const filteredConditions = conditions.filter(condition => condition);
    // 값이 있는 조건을 AND 연산자로 연결하여 SQL 쿼리 생성
    const combinedConditions = filteredConditions.join(' AND ');

    sql = `SELECT * FROM users.info WHERE ${combinedConditions} ORDER BY idinfo DESC`;
    console.log(`combinedConditions:${combinedConditions}`);

    connection.query(sql, (err,results) => {
      if (err) throw err;
      if (results.length > 0) {
        // console.log(results);
        res.json(results); // 결과값 프론트로 전송하기
      } else {
        res.send({ result: 'undifined' });
      }
    });
  }
}

let idinfo = '';

// 이용자 상세 정보 보기를 클릭했을 때
app.get('/personInfo', (req, res) => {
    // persondetail.html 파일을 다운로드 가능한 파일로 설정합니다.
    res.sendFile(path.join(__dirname, '../frontend', 'persondetail.html'));
    idinfo = req.query.idinfo;
    // console.log(`idinfo : ${idinfo}`)
});

// 이용자 찜한 숫자 전달하기
app.post('/favoriteCountProc', (req, res) => {
  let sql = `SELECT id FROM users.info WHERE idinfo = '${idinfo}'`;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const id = results[0].id;
      sql = `SELECT 
      COUNT(CASE WHEN id = '${req.session.userId}' AND selectedId = '${id}' THEN 1 END) AS selectedTologinUser,
      COUNT(CASE WHEN selectedId = '${id}' THEN 1 END) AS selectedIdCount
    FROM users.favorite;`;
      connection.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
          res.json(results);
        } else {
          console.log('id에 따른 Favorite Count 불러오기 실패');
        }
      });
    } else {
      res.send({ result : "there is no user for favorite count"});
    }
  });
});

// 이용자 상세 정보 전달하기
app.post('/personInfoProc', (req, res) => {

  let sql = '';
  let matchingUser = '';
  let openStatus = false; // 내가 열람 신청했을 경우
  let offerStatus = false; // 내가 매칭 신청을 했을 경우
  let receivedOffer = false; // 상대방이 나에게 매칭 신청을 했는지 여부
  let matchingStatus = false; // 상대방과 매칭이 된 상태인지를 확인하기

  // 열람 신청한 사람의 id 확인하기
  sql = `SELECT id FROM users.info WHERE idinfo = '${idinfo}'`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      matchingUser = results[0].id;
      console.log(`matchingUser:${matchingUser}`);

      // 내가 상대방을 열람했는지 확인
      if(req.session.userId) {
        sql = `SELECT * FROM users.matching WHERE offer_id = '${req.session.userId}' AND receive_id = '${matchingUser}' AND result = 'open'`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            openStatus = true;
          }
        });
      }
      
      // 내가 상대방에게 매칭 신청을 했는지 확인
      if(req.session.userId) {
        sql = `SELECT * FROM users.matching WHERE offer_id = '${req.session.userId}' AND receive_id = '${matchingUser}' AND result = 'offer'`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            offerStatus = true;
          }
        });
      }

      // 내가 매칭 신청을 받았는지 확인
      if(req.session.userId) {
        sql = `SELECT * FROM users.matching WHERE receive_id = '${req.session.userId}' AND offer_id = '${matchingUser}' AND result = 'offer'`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            receivedOffer = true;
          }
        });
      }

      // 매칭이 된 상대인지를 확인하기
      if(req.session.userId) {
        sql = `SELECT * FROM users.matching WHERE (offer_id = '${req.session.userId}' AND receive_id = '${matchingUser}' AND result = 'matched') 
        OR (offer_id = '${matchingUser}' AND receive_id = '${req.session.userId}' AND result = 'matched')`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            matchingStatus = true;
          }
        });
      }

      // 열람 신청한 사람의 정보 검색하기
      sql = `SELECT * FROM users.info WHERE idinfo = '${idinfo}'`;
      connection.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
          const responseData = {
            data: results,
            receivedOffer: receivedOffer,
            matchingStatus: matchingStatus,
            openStatus: openStatus,
            offerStatus: offerStatus,
          };
          // console.log(`responseData:${responseData['data'][0].id}`);
          res.json(responseData);
        } else {
          res.send({ result : "there is no user"});
        }
      });
    }
  });
});

// 이용자 매너 후기 관련 서버
app.post('/mannerReivewProc', (req, res) => {
  let id;
  console.log(`req.body.id:${req.body.id}`);
  if(req.body.id === null) {
    id = req.session.userId;
  } else {
    id = req.body.id;
  }
  let reviewList;
  let userReviews;
  let countReviewContents;
  // 후기 정보 불러오기
  let sql = `SELECT * FROM users.reviewcontent`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      reviewList = results;
      // 이용자의 후기 정보 불러오기
      sql = `SELECT * FROM users.reviewhistory WHERE matchingUser = '${id}'`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          userReviews = results;
          const reviewContentsArray = userReviews.map(review => review.reviewcontent);
          console.log(`reviewContentsArray:${reviewContentsArray}`);

          countReviewContents = reviewContentsArray.reduce((acc, reviewContent) => {
            acc[reviewContent] = (acc[reviewContent] || 0) + 1;
            return acc;
          }, {});
          
          console.log(countReviewContents);
        } 
        else {
          countReviewContents = undefined;
        }
        res.json({reviewList , countReviewContents});
      });
    }
  });
});

app.get('/logoutProc', (req, res) => {
  req.session.userId = undefined;
  res.sendFile(path.join(__dirname, '../frontend', 'matchinglist.html'));
});

// 추가 정보 열람하기 버튼에 대한 서버 작업
app.post('/additionalInfoProC', (req, res) => {

  let sql = '';
  let additional_infoPoint = '';
  let userPoint = '';
  const matchingUserId = req.body.selectedId;
  const gender = req.body.gender

  //로그인 여부를 확인한다
  if(!req.session.userId) {
    console.log('로그인이 되지 않았습니다');
    res.send({result : "NOT LOGIN"});
  } else {
    // 추가 정보 열람하기 Point 금액을 확인한다
    sql = `SELECT additional_info FROM users.pointpolicy WHERE gender ='${gender}'`;
    connection.query(sql, (err, results) => {

      if(err) throw err;
      if(results.length > 0) {
        console.log(`additional_info:${results[0].additional_info}`);
        additional_infoPoint = results[0].additional_info;

        // 이용자에 point정보를 확인한다.
        sql = `SELECT point FROM users.info WHERE id='${req.session.userId}'`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            console.log(`userPoint : ${results[0].point}`);
            userPoint = results[0].point;

            // point가 충분하지 않을 경우 -> 클라이언트에 포인트가 부족하다는 알림을 전달한다.
            if(userPoint < additional_infoPoint) {
              res.send({ result : "POINT NOT ENOUGH"});
            } 
            // point가 충분할 경우
            else {
              // -> point를 차감시키고
              userPoint -= additional_infoPoint;
              sql = `UPDATE users.info SET point = ${userPoint} WHERE id = '${req.session.userId}'`;
              connection.query(sql, (err, results) => {
                if(err) throw err;
                if(results.affectedRows > 0) {
                  console.log(`이용자 point 업데이트 완료 :${userPoint}`);
                  // -> point 내역에 history업로드를 하고
                  sql = `INSERT INTO pointusage (id, type, method, matchingUser, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`
                  const serialNumber = generateSerialNumber();
                  const values = [req.session.userId, '사용', '추가 정보 열람', matchingUserId, additional_infoPoint, serialNumber];
                  connection.query(sql, values, (err, results) => {
                    if(err) throw err;
                    console.log(`results.length : ${results.length}`);
                    if(results.affectedRows > 0) {
                      // matching list table에 추가한다.
                      sql = `INSERT INTO users.matching (offer_id, receive_id, result, open_date)
                      VALUES ( ?, ?, 'open', NOW());`;
                      const values = [req.session.userId, matchingUserId];
                      connection.query(sql, values, (err, results) => {
                        if(err) throw err;
                        if(results.affectedRows > 0) {
                          res.send({result : "SUCCESS"});
                        } else {
                          res.send({result : "FAIL"});
                        }
                      })

                    } else {
                      res.send({result : "FAIL"});
                    }
                  })
                }
              });
            }
          }
        });
      }
    });
  }
});

// 추가 정보 열람한 이용자 목록을 프론트에 전달하기
app.post('/additionalInfoUserListProC', (req, res) => {
  let sql = '';
  let openUserList = [];
  let exceptUserList = [];
  // 기본은 로그인 상태일 경우
  if(req.session.userId) {
    // 열람 조건 : open_date에 값이 있거나 offer_date에 값이 있는데 cancel_date에는 값이 없는 경우
    sql = `SELECT * FROM users.matching
    WHERE ((open_date IS NOT NULL) OR (offer_date IS NOT NULL AND cancel_date IS NULL))
    AND offer_id = '${req.session.userId}'`;
    connection.query(sql, (err, results) => {
      if(err) throw err;
      if(results.length > 0) {
        // openUserList = results;
        openUserList = results.map(result => {
          if (result.receive_id === req.session.userId) {
            return result.offer_id;
          } else {
            return result.receive_id;
          }
        });
        // 중복된 값을 제거한 openUserList 배열 얻기
        openUserList = openUserList.filter((value, index, self) => {
          return self.indexOf(value) === index;
        });
        console.log(`openUserList:${openUserList}`);
      } else {
        openUserList = undefined;
      }
      // 제외 조건 
      sql = `SELECT * FROM users.matching WHERE (result = 'matched' AND offer_id = '${req.session.userId}') OR (result = 'rejected' AND offer_id = '${req.session.userId}') OR (result = 'matched' AND receive_id = '${req.session.userId}') OR (result = 'rejected' AND receive_id = '${req.session.userId}')`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          exceptUserList = results;
          exceptUserList = results.map(result => {
            if (result.receive_id === req.session.userId) {
              return result.offer_id;
            } else {
              return result.receive_id;
            }
          });
          // 중복된 값을 제거한 exceptUserList 배열 얻기
          exceptUserList = exceptUserList.filter((value, index, self) => {
            return self.indexOf(value) === index;
          });
          console.log(`exceptUserList:${exceptUserList}`);
        } else {
          exceptUserList = undefined;
        }
        // 프론트로 정보 전달
        res.json({ openUserList, exceptUserList });
      });
    });
  }
});

// 포인트 사용 정보 
app.post('/pointUsageProC', (req, res) => {
  let sql = '';
  let type = req.body.type;
  let matchingOfferType = req.body.matchingOfferType;
  let gender = req.body.gender;
  let userPoint = ''; // 현재 이용자 포인트
  let paymentPointAmount = ''; // 이용자가 사용하거나 환급 받을 포인트
  let remainUserPoint = ''; // 수행 후 잔여 포인트

  if(gender === '남자') {
    gender = '여자';
  } else {
    gender = '남자';
  }

  console.log('matchingOfferType:',matchingOfferType);

  //현재 이용자의 포인트를 확인한다.
  sql = `SELECT point FROM users.info WHERE id='${req.session.userId}'`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      userPoint = results[0].point; // 이용자 포인트 정보
      // 이용자가 사용하거나 환급 받을 포인트를 확인한다.
      sql = `SELECT ${matchingOfferType} FROM users.pointpolicy WHERE gender ='${gender}'`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          if(matchingOfferType === 'matchingOffer_normal') {
            paymentPointAmount = results[0].matchingOffer_normal;
          } else if(matchingOfferType === 'matchingOffer_middle') {
            paymentPointAmount = results[0].matchingOffer_middle;
          } else if(matchingOfferType === 'matchingOffer_high') {
            paymentPointAmount = results[0].matchingOffer_high;
          } else {
            paymentPointAmount = results[0].additional_info;
          }

          // type(사용, 환급)에 따라서 remainPoint가 달라짐
          if(type === '사용') {
            remainUserPoint = userPoint - paymentPointAmount;
            res.json({userPoint, paymentPointAmount, remainUserPoint});
          } else if(type === '환급') {
            remainUserPoint = userPoint + paymentPointAmount;
            res.json({userPoint, paymentPointAmount, remainUserPoint});
          }
        }
      });
    }
  });
});

// 매칭 신청을 요청 했을 때 
app.post('/matchingOfferProC', (req, res) => {
  const offer_id = req.session.userId;
  const receive_id = req.body.selectedId;
  const matchingOfferType = req.body.matchingOfferType;
  let gender = req.body.gender;
  let userPoint = '';
  let paymentPoint = '';
  let sql = '';
  let values = ''

  if(gender === '남자') {
    gender = '여자';
  } else {
    gender = '남자';
  }

  // 로그인 여부 확인  
  if(!req.session.userId) {
    console.log('로그인이 되지 않았습니다');
    res.send({result : "NOT LOGIN"});
  } else { 
    // 동일한 사람에게 신청했을 경우(내가 신청을 했건, 요청을 받았건, 매칭이 되었건, 거절이 되었건)
    sql = `SELECT * FROM users.matching WHERE (offer_id = ? AND receive_id = ? AND (result = 'offer' OR result = 'matched' OR result = 'rejected')) 
    OR (offer_id = ? AND receive_id = ? AND (result = 'offer' OR result = 'matched'OR result = 'rejected'))`;
    values = [offer_id, receive_id, receive_id, offer_id];

    connection.query(sql, values, (err, results) => {
      if (err) throw err;
      // 결과 처리
      if (results.length > 0) {
        res.send({ result: 'HISTORY' });
      } else {
        console.log(`matchingOfferType:${matchingOfferType}`);
        // 매칭 신청 차감 포인트가 얼마인지 확인한다.
        sql = `SELECT ${matchingOfferType} FROM users.pointpolicy WHERE gender ='${gender}'`;
        connection.query(sql, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            if(matchingOfferType === 'matchingOffer_normal') {
              paymentPoint = results[0].matchingOffer_normal;
            } else if(matchingOfferType === 'matchingOffer_middle') {
              paymentPoint = results[0].matchingOffer_middle;
            } else if(matchingOfferType === 'matchingOffer_high') {
              paymentPoint = results[0].matchingOffer_high;
            }
            // console.log(`paymentPoint:${paymentPoint}`);
            // 이용자의 포인트를 확인한다.
            sql = `SELECT point FROM users.info WHERE id='${req.session.userId}'`;
            connection.query(sql, (err, results) => {
              if(err) throw err;
              if(results.length > 0) {
                userPoint = results[0].point; // 이용자의 포인트 확보
                // 포인트가 부족할 경우 -> 클라이언트에 전달한다.
                if(userPoint < paymentPoint) {
                  res.send({result : "POINT NOT ENOUGH"});
                } else {          
                  // 포인트가 충분할 경우 -> 이용자 포인트를 차감한다.
                  userPoint -= paymentPoint;
                  // console.log(`userPoint:${userPoint}`);
                  sql = `UPDATE users.info SET point = ${userPoint} WHERE id = '${req.session.userId}'`;
                  connection.query(sql, (err, results) => { 
                    if(err) throw err;
                    if(results.affectedRows > 0) {
                      console.log(`이용자 point 업데이트 완료 :${userPoint}`);
                      // -> point 내역에 history업로드를 하고
                      sql = `INSERT INTO pointusage (id, type, method, matchingUser, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
                      const serialNumber = generateSerialNumber();
                      values = [req.session.userId, '사용', '매칭 신청', receive_id, paymentPoint, serialNumber];
                      connection.query(sql, values, (err, results) => {
                        if(err) throw err;
                        if(results.affectedRows > 0) {
                          // matching table에 history업데이트를 한다
                          sql = `UPDATE users.matching SET result = 'offer', offer_date = NOW() WHERE offer_id = ? AND receive_id = ? AND (result = 'open' OR result = 'canceled')`;
                          values = [offer_id, receive_id];
                        
                          connection.query(sql, values, (err, results) => {
                            if (err) throw err;
                            // 결과 처리
                            if (results.affectedRows > 0) {
                              res.send({ result: 'SUCCESS' });
                            } else {
                              // matching table에 기존 history가 없다는 것을 의미한다. => 새로 테이블에 history추가
                              sql = `INSERT INTO users.matching (offer_id, receive_id, result, offer_date)
                              VALUES ( ?, ?, 'offer', NOW());`;
                              values = [offer_id, receive_id];
                              connection.query(sql, values, (err, results) => {
                                if(err) throw err;
                                if(results.affectedRows > 0) {
                                  res.send({ result: 'SUCCESS' });
                                } else {
                                  res.send({ result : 'FAIL'});
                                }
                              })
                            }
                          });
                        } 
                      })
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  }
});


// 시리얼 넘버 생성하는 함수
function generateSerialNumber() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const serialNumberLength = 10;
  let serialNumber = '';

  for (let i = 0; i < serialNumberLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    serialNumber += characters.charAt(randomIndex);
  }

  return serialNumber;
}

let dashboardCategoryRecog;
// 대시보드와 연결하는 서버
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dashboard.html'));
  dashboardCategoryRecog = req.query.categoryRecog;
  // console.log(`dashboardCategoryRecog:${dashboardCategoryRecog}`);
});

// let lastCategory = undefined;
// 대시보드 이용자 List 요청에 따른 서버 동작
app.post('/dashboardUserListProc', (req, res) => {
  // let categoryRecog = req.body.categoryRecog;
  // if(categoryRecog) {
    
  // }
  const categoryRecog = dashboardCategoryRecog;

  console.log(`dashboardCategoryRecog:${dashboardCategoryRecog}`);
  // if(categoryRecog === undefined) {
  //   if(lastCategory === undefined) {
  //     categoryRecog = 'open';
  //     lastCategory = categoryRecog;
  //   } else {
  //     if(lastCategory === 'open') {
  //       categoryRecog = lastCategory;
  //     } else if(lastCategory === 'offer') {
  //       categoryRecog = lastCategory;
  //     } else if(lastCategory === 'receive') {
  //       categoryRecog = lastCategory;
  //     } else if(lastCategory === 'matching') {
  //       categoryRecog = lastCategory;
  //     }
  //   }
  // } else {
  //   lastCategory = categoryRecog;
  // }
  const id = req.session.userId;
  // console.log(`categoryRecog:${categoryRecog}`);

  let receiveIds = '';
  let sql = '';
  let values = '';

  let result1 = ''; // 첫번째 query문의 결과
  let result2 = ''; // 두번째 query문의 결과

  // 정보 열람 목록일 경우
  if(categoryRecog === 'open') {
    sql = `SELECT * FROM users.matching WHERE offer_id = ? AND result IN ('open') ORDER BY open_date DESC`;
    values = [id];

    connection.query(sql, values, (err, results) => {
      if(err) throw err;
      if (results.length > 0) {
        receiveIds = results.map((row) => row.receive_id);
        result1 = results; // 첫번째 결과를 넣기

        // 결과값을 기반으로 users.info에서 상세 data 받기
        sql = `SELECT * FROM users.info WHERE id IN (?)`;
        values = [receiveIds];

        connection.query(sql, values, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            result2 = results;

            const combinedResults = [];

            result1.forEach((result1) => {
              // results1의 receive_id 추출
              const receiveId = result1.receive_id;
              
              // results2에서 해당 receive_id와 일치하는 요소 찾기
              const matchingResult2 = result2.find((result2) => result2.id === receiveId);

              if (matchingResult2) {
                // 일치하는 요소가 있다면, 결과를 합쳐서 combinedResults에 추가
                const combinedResult = { ...result1, ...matchingResult2 };
                combinedResults.push(combinedResult);
              }
            });
            combinedResults.forEach((result) => {
              result.categoryRecog = categoryRecog;
            });
            res.json(combinedResults); // 최종 결과 user list 전달하기
          } else {
            res.send({ result: 'undifined', categoryRecog : categoryRecog });
          }
        });
      } 
      else {
        res.send({ result: 'undifined', categoryRecog : categoryRecog });
      }
    });
  }
  // 보낸 신청 목록일 경우
  else if(categoryRecog === 'offer') {
    sql = `SELECT * FROM users.matching WHERE offer_id = ? AND result IN ('offer') ORDER BY offer_date DESC`;
    values = [id];

    connection.query(sql, values, (err, results) => {
      if(err) throw err;
      if (results.length > 0) {
        receiveIds = results.map((row) => row.receive_id);
        result1 = results; // 첫번째 결과를 넣기

        // 결과값을 기반으로 users.info에서 상세 data 받기
        sql = `SELECT * FROM users.info WHERE id IN (?)`;
        values = [receiveIds];

        connection.query(sql, values, (err, results) => {
          if(err) throw err;
          if(results.length > 0) {
            result2 = results;

            const combinedResults = [];

            result1.forEach((result1) => {
              // results1의 receive_id 추출
              const receiveId = result1.receive_id;
              
              // results2에서 해당 receive_id와 일치하는 요소 찾기
              const matchingResult2 = result2.find((result2) => result2.id === receiveId);

              if (matchingResult2) {
                // 일치하는 요소가 있다면, 결과를 합쳐서 combinedResults에 추가
                const combinedResult = { ...result1, ...matchingResult2 };
                combinedResults.push(combinedResult);
              }
            });
            combinedResults.forEach((result) => {
              result.categoryRecog = categoryRecog;
            });
            res.json(combinedResults); // 최종 결과 user list 전달하기
          } else {
            res.send({ result: 'undifined', categoryRecog : categoryRecog });
          }
        });
      } 
      else {
        res.send({ result: 'undifined', categoryRecog : categoryRecog });
      }
    });
  } 
  // 신청 받은 목록일 경우
  else if(categoryRecog === 'receive') {
    sql = `SELECT * FROM users.matching WHERE receive_id = ? AND result IN ('offer') ORDER BY offer_date DESC`;
    values = [id];

    connection.query(sql, values, (err, results) => {
      if (err) throw err;
      if(results.length > 0) {
        receiveIds = results.map((row) => row.offer_id);
        result1 = results; // 첫번째 결과를 넣기

        // 결과를 기반으로 user list 결과값 front로 전달하기
        sql = `SELECT * FROM users.info WHERE id IN (?)`;
        values = [receiveIds];

        connection.query(sql, values, (err, results) => {
          if (err) throw err;
          if(results.length > 0) {
            result2 = results; // 두번째 결과를 넣기

            const combinedResults = [];

            result1.forEach((result1) => {
              // results1의 offer_id 추출
              const receiveId = result1.offer_id;
              // results2에서 해당 offer_id와 일치하는 요소 찾기
              const matchingResult2 = result2.find((result2) => result2.id === receiveId);

              if (matchingResult2) {
                // 일치하는 요소가 있다면, 결과를 합쳐서 combinedResults에 추가
                const combinedResult = { ...result1, ...matchingResult2 };
                combinedResults.push(combinedResult);
              }
            });
            combinedResults.forEach((result) => {
              result.categoryRecog = categoryRecog;
            });
            res.json(combinedResults); // 최종 결과 user list 전달하기
          } 
          else {
            res.send({ result: 'undifined', categoryRecog : categoryRecog });
          }
        });
      }
      else {
        res.send({ result: 'undifined', categoryRecog : categoryRecog });
      }
    });
  }
  // 매칭 목록일 경우
  else if(categoryRecog === 'matching') {
    sql = `SELECT * FROM users.matching WHERE (offer_id = ? OR receive_id = ?) AND result = 'matched' ORDER BY offer_date DESC`;
    values = [id, id];
    connection.query(sql, values, (err, results) => {
      if (err) throw err;
      if(results.length > 0) {
        const receiveIds = [];

        for (const result of results) {
          if (id === result.receive_id) {
            receiveIds.push(result.offer_id);
          } else {
            receiveIds.push(result.receive_id);
          }
        }

        result1 = results; // 첫번째 결과를 넣기

        // 결과를 기반으로 user list 결과값 front로 전달하기
        sql = `SELECT * FROM users.info WHERE id IN (?)`;
        values = [receiveIds];

        connection.query(sql, values, (err, results) => {
          if (err) throw err;
          if(results.length > 0) {
            result2 = results;

            const combinedResults = [];
            let i = 0;

            result1.forEach((result1) => {

              // results1의 receive_id 추출
              // const receiveId = result1.receive_id;
              // console.log(receiveIds);
              
              // results2에서 해당 receive_id와 일치하는 요소 찾기
              const matchingResult2 = result2.find((result2) => result2.id === receiveIds[i]);
              // console.log(matchingResult2);

              if (matchingResult2) {
                // 일치하는 요소가 있다면, 결과를 합쳐서 combinedResults에 추가
                const combinedResult = { ...result1, ...matchingResult2 };
                combinedResults.push(combinedResult);
                // console.log(combinedResults);
              }
              i++;
              
            });
            combinedResults.forEach((result) => {
              result.categoryRecog = categoryRecog;
            });
            res.json(combinedResults); // 최종 결과 user list 전달하기
          } else {
            res.send({ result: 'undifined', categoryRecog : categoryRecog });
          }
        });
      } 
      else {
        res.send({ result: 'undifined', categoryRecog : categoryRecog });
      }
    });
  }
});

// 매칭 취소하기
app.post('/matchingCancelProC', (req, res) => {
  const offer_id = req.session.userId; // 매칭 신청을 한사람
  const receive_id = req.body.id; // 매칭 신청을 받은 사람
  const matchingOfferType = req.body.matchingOfferType;
  let gender = req.body.gender;
  let userPoint = '';
  let paymentPoint = '';
  let sql = '';
  let values = ''

  if(gender === '남자') {
    gender = '여자';
  } else {
    gender = '남자';
  }

  // 환불 비용이 얼마인지 확인한다.
  sql = `SELECT ${matchingOfferType} FROM users.pointpolicy WHERE gender ='${gender}'`;
  connection.query(sql, (err, results) => { 
    if(err) throw err;
    if(results.length > 0) {
      if(matchingOfferType === 'matchingOffer_normal') {
        paymentPoint = results[0].matchingOffer_normal;
      } else if(matchingOfferType === 'matchingOffer_middle') {
        paymentPoint = results[0].matchingOffer_middle;
      } else if(matchingOfferType === 'matchingOffer_high') {
        paymentPoint = results[0].matchingOffer_high;
      }
      // 이용자 point를 확인한다
      sql = `SELECT point FROM users.info WHERE id='${req.session.userId}'`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          userPoint = results[0].point; // 이용자의 포인트 확보
          // 이용자 포인트를 환급한다
          userPoint += paymentPoint;
          // 환급된 이용자 포인트를 DB에 저장한다.
          sql = `UPDATE users.info SET point = ${userPoint} WHERE id = '${req.session.userId}'`;
          connection.query(sql, (err, results) => { 
            if(err) throw err;
            if(results.affectedRows > 0) {   
              console.log(`이용자 point 업데이트 완료 :${userPoint}`);
              // pointusage테이블에 환불 히스토리를 업데이트 한다.
              sql = `INSERT INTO pointusage (id, type, method, matchingUser, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
              const serialNumber = generateSerialNumber();
              values = [req.session.userId, '환급', '매칭 취소', receive_id, paymentPoint, serialNumber];
              connection.query(sql, values, (err, results) => {
                if(err) throw err;
                if(results.affectedRows > 0) {
                  // 이용자 열람 상태를 확인한다.
                  sql = `SELECT * FROM users.matching WHERE offer_id = ? AND receive_id = ? AND open_date is NOT NULL AND result = 'offer'`;
                  values = [offer_id, receive_id];
                  connection.query(sql, values, (err, results) => {
                    // 이미 열람한 이용자
                    if(results.length > 0) {
                      // 취소된 것을 업데이트 한다.
                      sql = `UPDATE users.matching SET result = 'open', cancel_date = NOW() WHERE offer_id = ? AND receive_id = ? AND result = 'offer'`;
                      values = [offer_id, receive_id];
                      connection.query(sql, values, (err, results) => {
                        if(err) throw err;
                        if(results.affectedRows > 0) {
                          res.send({ result: 'SUCCESS' });
                        } else {
                          res.send({ result: 'FAIL' });
                          console.log('pointusage 테이블 업데이트에서 오류 발생!');
                        }
                      });
                    }
                    // 열람한 적이 없는 이용자
                    else {
                      // 취소된 것을 업데이트 한다.
                      sql = `UPDATE users.matching SET result = 'canceled', cancel_date = NOW() WHERE offer_id = ? AND receive_id = ? AND result = 'offer'`;
                      values = [offer_id, receive_id];
                      connection.query(sql, values, (err, results) => {
                        if(err) throw err;
                        if(results.affectedRows > 0) {
                          res.send({ result: 'SUCCESS' });
                        } else {
                          res.send({ result: 'FAIL' });
                          console.log('pointusage 테이블 업데이트에서 오류 발생!');
                        }
                      });
                    }
                  });
                }          
              });
            }
          })          
        }   
      });
    }
  });
});

// 매칭 수락하기
app.post('/matchingAcceptProC', (req, res) => {
  const offer_id = req.body.id; // 매칭 신청을 한사람(상대방)
  const receive_id = req.session.userId; // 매칭 신청을 받은 사람(나)
  const matchingOfferType = req.body.matchingOfferType;
  let gender = req.body.gender;
  let userPoint = '';
  let paymentPoint = '';
  let sql = '';
  let values = ''

  if(gender === '남자') {
    gender = '여자';
  } else {
    gender = '남자';
  }

  // 수락 비용이 얼마인지 확인한다.
  sql = `SELECT ${matchingOfferType} FROM users.pointpolicy WHERE gender ='${gender}'`;
  connection.query(sql, (err, results) => { 
    if(err) throw err;
    if(results.length > 0) {
      if(matchingOfferType === 'matchingOffer_normal') {
        paymentPoint = results[0].matchingOffer_normal;
      } else if(matchingOfferType === 'matchingOffer_middle') {
        paymentPoint = results[0].matchingOffer_middle;
      } else if(matchingOfferType === 'matchingOffer_high') {
        paymentPoint = results[0].matchingOffer_high;
      }
      // 이용자 point를 확인한다
      sql = `SELECT point FROM users.info WHERE id='${req.session.userId}'`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          userPoint = results[0].point; // 이용자의 포인트 확보
          // 이용자 포인트가 부족할 경우
          if(userPoint < paymentPoint) {
            res.send({result : "POINT NOT ENOUGH"});
          } 
          // 포인트가 있을 경우
          else {
            // 이용자 포인트를 차감한다
            userPoint -= paymentPoint;
            // 차감된 이용자 포인트를 DB에 저장한다.
            sql = `UPDATE users.info SET point = ${userPoint} WHERE id = '${req.session.userId}'`;
            connection.query(sql, (err, results) => { 
              if(err) throw err;
              if(results.affectedRows > 0) {   
                console.log(`이용자 point 업데이트 완료 :${userPoint}`);
                // pointusage 테이블에 사용 히스토리를 업데이트 한다.
                sql = `INSERT INTO pointusage (id, type, method, matchingUser, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
                const serialNumber = generateSerialNumber();
                values = [req.session.userId, '사용', '매칭 수락', offer_id, paymentPoint, serialNumber];
                connection.query(sql, values, (err, results) => {
                  if(err) throw err;
                  if(results.affectedRows > 0) {
                    // 매칭된 것을 업데이트 한다.
                    sql = `UPDATE users.matching SET result = 'matched', matching_date = NOW() WHERE offer_id = ? AND receive_id = ? AND result = 'offer'`;
                    values = [offer_id, receive_id];
                    connection.query(sql, values, async (err, results) => {
                      if(err) throw err;
                      if(results.affectedRows > 0) {

                        // 서로에게 알람을 보낸다.
                        // offer_id의 정보들을 불러온다
                        async function fetchGetInfoFromOfferId(offer_id) {
                          return new Promise((resolve, reject) => {
                            sql = `SELECT * FROM users.info WHERE id = '${offer_id}'`;
                            connection.query(sql, (err, results) => {
                              if(err) {
                                reject(err);
                              } else {
                                resolve(results[0]);
                              }
                            });
                          });
                        }

                        const offerIdInfo = await fetchGetInfoFromOfferId(offer_id);
                        console.log('offerIdInfo:',offerIdInfo);

                        // receive_id의 정보들을 불러온다
                        async function fetchGetInfoFromReceiveId(receive_id) {
                          return new Promise((resolve, reject) => {
                            sql = `SELECT * FROM users.info WHERE id = '${receive_id}'`;
                            connection.query(sql, (err, results) => {
                              if(err) {
                                reject(err);
                              } else {
                                resolve(results[0]);
                              }
                            });
                          });
                        }

                        const receiveIdInfo = await fetchGetInfoFromReceiveId(receive_id);
                        console.log('receiveIdInfo:',receiveIdInfo);

                        // messageService.send({
                        //   'to': receiveIdInfo.phone,
                        //   'from': '01040718523',
                        //   'text': `[COUMEET] ${receiveIdInfo.nickname}님과 매칭이 완료되었습니다.\n\n${receiveIdInfo.nickname}의 매칭 정보는 아래와 같습니다.\n- 이름 :${receiveIdInfo.name}\n- 연락처: ${receiveIdInfo.phone}]\n- 직업: ${receiveIdInfo.occupation}\n- 사는곳: ${receiveIdInfo.regionCity} ${receiveIdInfo.regionGu}\n\n너무 늦지 않게 연락하세요. 서로의 노력과 원하는 마음으로 매칭이 된 만큼 소중한 인연으로 이뤄지길 진심으로 바랍니다 :)\n\n해당 알림은 재전송되지 않습니다. 상대방의 정보는 별도로 잘 보관해주시면 감사하겠습니다.`
                        // });

                        // messageService.send({
                        //   'to': offerIdInfo.phone,
                        //   'from': '01040718523',
                        //   'text': `[COUMEET] ${offerIdInfo.nickname}님과 매칭이 완료되었습니다.\n\n${offerIdInfo.nickname}의 매칭 정보는 아래와 같습니다.\n- 이름: ${offerIdInfo.name}\n- 연락처: ${offerIdInfo.phone}\n- 직업: ${offerIdInfo.occupation}\n- 사는곳: ${offerIdInfo.regionCity} ${offerIdInfo.regionGu}\n\n너무 늦지 않게 연락하세요. 서로의 노력과 원하는 마음으로 매칭이 된 만큼 소중한 인연으로 이뤄지길 진심으로 바랍니다 :)\n\n해당 알림은 재전송되지 않습니다. 상대방의 정보는 별도로 잘 보관해주시면 감사하겠습니다.`
                        // });

                        res.send({ result: 'SUCCESS' });

                      } else {
                        res.send({ result: 'FAIL' });
                        console.log('matching list 테이블 업데이트에서 오류 발생!');
                      }
                    });
                  } else {
                    res.send({ result: 'FAIL' });
                    console.log('pointusage 테이블 업데이트에서 오류 발생!');
                  }
                });
              }       
            });
          }
        }
      })          
    }
  });
});

// 매칭 거절하기
app.post('/matchingRejectProC', (req, res) => {
  const offer_id = req.body.id; // 매칭 신청을 한사람(상대방)
  const receive_id = req.session.userId; // 매칭 신청을 받은 사람(나)
  const matchingOfferType = req.body.matchingOfferType;
  const gender = req.body.gender;
  let userPoint = '';
  let paymentPoint = '';
  let sql = '';
  let values = ''

  // 거절 비용이 얼마인지 확인한다.
  sql = `SELECT ${matchingOfferType} FROM users.pointpolicy WHERE gender ='${gender}'`;
  connection.query(sql, (err, results) => { 
    if(err) throw err;
    if(results.length > 0) {
      if(matchingOfferType === 'matchingOffer_normal') {
        paymentPoint = results[0].matchingOffer_normal;
      } else if(matchingOfferType === 'matchingOffer_middle') {
        paymentPoint = results[0].matchingOffer_middle;
      } else if(matchingOfferType === 'matchingOffer_high') {
        paymentPoint = results[0].matchingOffer_high;
      }
      // 매칭 신청한 상대방의 point를 확인한다
      sql = `SELECT point FROM users.info WHERE id='${offer_id}'`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          userPoint = results[0].point; // 이용자의 포인트 확보
          // 이용자 포인트를 환급한다
          userPoint += paymentPoint;
          // 환급된 이용자 포인트를 DB에 저장한다.
          sql = `UPDATE users.info SET point = ${userPoint} WHERE id = '${offer_id}'`;
          connection.query(sql, (err, results) => { 
            if(err) throw err;
            if(results.affectedRows > 0) {   
              console.log(`이용자 point 업데이트 완료 :${userPoint}`);
              // pointusage테이블에 환불 히스토리를 업데이트 한다.
              sql = `INSERT INTO pointusage (id, type, method, matchingUser, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
              const serialNumber = generateSerialNumber();
              values = [offer_id, '환급', '매칭 거절', receive_id, paymentPoint, serialNumber];
              connection.query(sql, values, (err, results) => {
                if(err) throw err;
                if(results.affectedRows > 0) {
                    // 거절한 것을 업데이트 한다.
                    sql = `UPDATE users.matching SET result = 'rejected', reject_date = NOW() WHERE offer_id = ? AND receive_id = ? AND result = 'offer'`;
                    values = [offer_id, receive_id];
                    connection.query(sql, values, (err, results) => {
                      if(err) throw err;
                      if(results.affectedRows > 0) {
                        res.send({ result : "SUCCESS"});
                      } else {
                        res.send({ result: 'FAIL' });
                        console.log('matching list 테이블 업데이트에서 오류 발생!');
                      }
                    });
                } else {
                  res.send({ result: 'FAIL' });
                  console.log('pointusage 테이블 업데이트에서 오류 발생!');
                }
              });
            }       
          });
        }
      })          
    }
  });
});


app.get('/matchinglist', (req, res) => {

  res.sendFile(path.join(__dirname, '../frontend', 'matchinglist.html'));
  const category = req.body.category;
  const id = req.session.userId;
  
  let receiveIds = '';
  let sql = '';
  let values = '';

  let result1 = ''; // 첫번째 query문의 결과
  let result2 = ''; // 두번째 query문의 결과

  if(category == 'offer') {

    sql = `SELECT * FROM users.matching WHERE offer_id = ? AND result NOT IN ('matched', 'rejected') ORDER BY offer_date`;
    values = [id];

    connection.query(sql, values, (err, results) => {
      if (err) throw err;
    
      // 결과 처리
      if (results.length > 0) {
        receiveIds = results.map((row) => row.receive_id);
        result1 = results; // 첫번째 결과를 넣기

        // 결과를 기반으로 user list 결과값 front로 전달하기
        sql = `SELECT * FROM users.info WHERE id IN (?)`;
        values = [receiveIds];

        connection.query(sql, values, (err, results) => {

          if (err) throw err;

          if(results.length > 0) {
            result2 = results;

            const combinedResults = [];

            result1.forEach((result1) => {
              // results1의 receive_id 추출
              const receiveId = result1.receive_id;
              
              // results2에서 해당 receive_id와 일치하는 요소 찾기
              const matchingResult2 = result2.find((result2) => result2.id === receiveId);

              if (matchingResult2) {
                // 일치하는 요소가 있다면, 결과를 합쳐서 combinedResults에 추가
                const combinedResult = { ...result1, ...matchingResult2 };
                combinedResults.push(combinedResult);
              }
            });
            res.json(combinedResults); // 최종 결과 user list 전달하기
          } else {
            res.send({ result: 'undifined' });
          }
        });
      } else {
        res.send({ result: 'undifined' });
      }
    });
    
  } else if(category == 'receive') {

    sql = `SELECT * FROM users.matching WHERE receive_id = ? AND result NOT IN ('matched', 'rejected') ORDER BY offer_date`;
    values = [id];
    
    connection.query(sql, values, (err, results) => {
      if (err) throw err;
    
      // 결과 처리
      if (results.length > 0) {
        receiveIds = results.map((row) => row.offer_id);
        result1 = results; // 첫번째 결과를 넣기

        // 결과를 기반으로 user list 결과값 front로 전달하기
        sql = `SELECT * FROM users.info WHERE id IN (?)`;
        values = [receiveIds];

        connection.query(sql, values, (err, results) => {

          if (err) throw err;

          if(results.length > 0) {
            result2 = results; // 두번째 결과를 넣기

            const combinedResults = [];

            result1.forEach((result1) => {
              // results1의 offer_id 추출
              const receiveId = result1.offer_id;
              
              // results2에서 해당 offer_id와 일치하는 요소 찾기
              const matchingResult2 = result2.find((result2) => result2.id === receiveId);

              if (matchingResult2) {
                // 일치하는 요소가 있다면, 결과를 합쳐서 combinedResults에 추가
                const combinedResult = { ...result1, ...matchingResult2 };
                combinedResults.push(combinedResult);
              }
            });
            res.json(combinedResults); // 최종 결과 user list 전달하기
          } else {
            res.send({ result: 'undifined' });
          }
        });
      } else {
        res.send({ result: 'undifined' });
      }
    });
  } else if(category == 'matching') {
    sql = `SELECT * FROM users.matching WHERE (offer_id = ? OR receive_id = ?) AND result = 'matched' ORDER BY offer_date`;
    values = [id, id];

    connection.query(sql, values, (err, results) => {
      if (err) throw err;

      const receiveIds = [];
    
      // 결과 처리
      if (results.length > 0) {

        for (const result of results) {
          if (id === result.receive_id) {
            receiveIds.push(result.offer_id);
          } else {
            receiveIds.push(result.receive_id);
          }
        }

        // console.log(`receiveIds:${receiveIds}`);
        result1 = results; // 첫번째 결과를 넣기

        // 결과를 기반으로 user list 결과값 front로 전달하기
        sql = `SELECT * FROM users.info WHERE id IN (?)`;
        values = [receiveIds];

        connection.query(sql, values, (err, results) => {

          if (err) throw err;

          // console.log(`results : ${results}`);

          if(results.length > 0) {
            result2 = results;

            const combinedResults = [];
            let i = 0;

            result1.forEach((result1) => {

              // results1의 receive_id 추출
              // const receiveId = result1.receive_id;
              // console.log(receiveIds);
              
              // results2에서 해당 receive_id와 일치하는 요소 찾기
              const matchingResult2 = result2.find((result2) => result2.id === receiveIds[i]);

              console.log(matchingResult2);

              if (matchingResult2) {
                // 일치하는 요소가 있다면, 결과를 합쳐서 combinedResults에 추가
                const combinedResult = { ...result1, ...matchingResult2 };
                combinedResults.push(combinedResult);
                // console.log(combinedResults);
              }
              i++;
              
            });
            res.json(combinedResults); // 최종 결과 user list 전달하기
          } else {
            res.send({ result: 'undifined' });
          }
        });
      } else {
        res.send({ result: 'undifined' });
      }
    });
  }
});

// 후기 작성 여부 확인
app.post('/reviewReportHistoryCheckProC', (req, res) => {
  const actionUser = req.session.userId;
  const matchingUser = req.body.id;
  let reviewCheckRecog = false;
  let reportCheckRecog = false;
  let sql = '';

  // 이미 후기를 작성한 이용자인지 확인하기
  sql = `SELECT * FROM users.reviewhistory WHERE reviewer = '${actionUser}' AND matchingUser ='${matchingUser}';`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      reviewCheckRecog = true;
      // res.send({result : 'REVIEW ALREADY DID'});
    } else {
      reviewCheckRecog = false;
      // res.send({results : 'REVIEW FIRST TIME'})
    }

    sql = `SELECT * FROM users.reporthistory WHERE reporter = '${actionUser}' AND matchingUser ='${matchingUser}';`;
    connection.query(sql, (err, results) => {
      if(err) throw err;
      if(results.length > 0) {
        reportCheckRecog = true;
      } else {
        reportCheckRecog = false;
      }
      // console.log(`reviewCheckRecog:${reviewCheckRecog}`);
      // console.log(`reportCheckRecog:${reportCheckRecog}`);

      res.json({reviewCheckRecog , reportCheckRecog});

    });
  });
});

// 후기 팝업 시 정보 전달하기
app.post('/reviewcontentProC', (req, res) => {
  const sql = `SELECT * FROM users.reviewcontent`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      res.json(results);
    } else {
      console.log(`리뷰 정보 불러오기 Error!`);
      res.send({result : 'FAIL TO LOAD'});
    }
  });
});

// 후기 history 기록하기
app.post('/reviewHistoryProC', (req, res) => {
  const reviewer = req.session.userId;
  const matchingUser = req.body.id;
  const selectedReviewContents = req.body.selectedReviewContents;

  // 이미 후기를 작성한 이용자인지 확인하기
  let sql = `SELECT * FROM users.reviewhistory WHERE reviewer = '${reviewer}' AND matchingUser ='${matchingUser}';`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      res.send({result : 'ALREADY DID'});
    } else {
      // INSERT 쿼리를 위한 SQL 템플릿
      sql = `INSERT INTO users.reviewhistory (reviewer, matchingUser, reviewcontent, date) VALUES (?, ?, ?, now())`;

      // 선택한 리뷰 내용 배열을 순회하면서 각 요소를 DB에 추가
      selectedReviewContents.forEach(content => {
        const values = [reviewer, matchingUser, content];
        connection.query(sql, values, (err, results) => {
          if (err) {
            console.error(`리뷰 History 기록하기 Error: ${err}`);
            res.send({ result: 'FAIL TO INSERT' });
          }
        });
      });
      res.send({ result: 'SUCCESS' });
    }
  });
});

// 신고하기 팝업 시 정보 전달하기
app.post('/reportcontentProC', (req, res) => {
  const sql = `SELECT * FROM users.reportcontent`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      res.json(results);
    } else {
      console.log(`신고하기 정보 불러오기 Error!`);
      res.send({result : 'FAIL TO LOAD'});
    }
  });
});

// 신고 history 기록하기
app.post('/reportHistoryProC', (req, res) => {
  const reporter = req.session.userId;
  const matchingUser = req.body.id;
  const selectedReportContents = req.body.selectedReportContents;
  const reportcontent = selectedReportContents.join(', ');
  const reportInputValue = req.body.reportInputValue;

  console.log(`selectedReportContents:${selectedReportContents.length}`);

  // 이미 신고를 작성한 이용자인지 확인하기
  let sql = `SELECT * FROM users.reporthistory WHERE reporter = '${reporter}' AND matchingUser ='${matchingUser}';`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      res.send({result : 'ALREADY DID'});
    } else {
      // INSERT 쿼리를 위한 SQL 템플릿
      sql = `INSERT INTO users.reporthistory (reporter, matchingUser, reportcontent, extraText, date) VALUES (?, ?, ?, ?, now())`;
      const values = [reporter, matchingUser, reportcontent, reportInputValue];
      connection.query(sql, values, (err, results) => {
        if(err) throw err;
        if(results.affectedRows > 0) {
          // 이용자 정보에 reportCount 누적하기
          // 이용자의 reportCount 불러오기
          sql = `SELECT reportCount FROM users.info WHERE id='${matchingUser}'`;
          connection.query(sql, (err, results) => {
            if(err) throw err;
            if(results.length > 0) {
              let userReportCount = results[0].reportCount;
              // console.log('userReportCount:',userReportCount);
              if(userReportCount === null) {
                userReportCount = 0;
              }
              userReportCount += 1; // 신고 회수 추가하기
              // console.log(`userReportCount:${userReportCount}`);
              // 신고 누적이 5회 이상인 경우 처리
              if(userReportCount >= 5) {
                sql = `UPDATE users.info SET reportCount = ${userReportCount}, signupStatus = 'STOP', stopDate = NOW() WHERE id='${matchingUser}'`;
              } 
              // 이용자의 +1이 된 reportCount 추가하기
              else {
                sql = `UPDATE users.info SET reportCount = ${userReportCount} WHERE id='${matchingUser}'`;
              }
              connection.query(sql, (err, results) => {
                if(err) throw err;
                if(results.affectedRows > 0) {
                  res.send({ result: 'SUCCESS' });
                } else {
                  console.error(`신고 History 기록하기 Error: ${err}`);
                  res.send({ result: 'FAIL TO INSERT' });  
                }
              });
            }
          }); 
        } else {
          console.error(`신고 History 기록하기 Error: ${err}`);
          res.send({ result: 'FAIL TO INSERT' });
        }
      });
    }
  });
});

// 포인트 충전 청보 전달하기
app.post('/pointRechargeInfoProC', (req, res) => {
  let pointRechargeInfo;
  let userPoint;
  // 포인트 정책을 받아온다
  let sql = `SELECT * FROM users.pointrechargepolicy`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      pointRechargeInfo = results;
      // res.json(results);
      sql = `SELECT point FROM users.info WHERE id = '${req.session.userId}'`;
      connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
          userPoint = results;
          res.json({pointRechargeInfo, userPoint});
        }
      });
    }
  });
})

// 포인트 충전하기
app.post('/pointRechargeProC', (req, res) => {
  const totalPointAmount = req.body.totalPointAmount;
  const selectedPointAmount = req.body.selectedPointAmount;
  console.log(`===========`);
  console.log(`selectedPointAmount:${selectedPointAmount}`);
  console.log(`totalPointAmount:${totalPointAmount}`);
  //포인트 history에 업데이트 한다.
  let sql = `UPDATE users.info SET point = ${totalPointAmount} WHERE id = '${req.session.userId}'`;
  connection.query(sql, (err, results) => {
    if(err) throw err;
    if(results.affectedRows > 0) {
      sql = `INSERT INTO pointusage (id, type, method, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, NOW())`;
      const serialNumber = generateSerialNumber();
      const values = [req.session.userId, '충전', '포인트 충전', selectedPointAmount, serialNumber];
      connection.query(sql, values, (err, results) => {
        if(err) throw err;
        if(results.affectedRows > 0) {
          res.send({result : 'SUCCESS'});
        } else {
          res.send({result : 'FAIL'});
        }
      })
    } else {
      res.send({result : 'FAIL'});
    }
  });
});

// 포인트 환불하기
app.post('/pointRefundProC', (req, res) => {
  const bankName = req.body.bankName;
  const accountNumber = req.body.accountNumber;
  const point = req.body.userPoint;
  const id = req.session.userId;
  const serialNumber = generateSerialNumber();

  // 환불 목록에 추가하기
  let sql = `INSERT INTO users.pointrefund (id, bankName, accountNumber, point, date, status) VALUES (?, ?, ?, ?, NOW(), 'READY')`;
  let values = [id, bankName, accountNumber, point];
  connection.query(sql, values, (err, results) => {
    if(err) throw err;
    if(results.affectedRows > 0) {
      // pointusage에 환불 내역 업데이트하기
      sql = `INSERT INTO pointusage (id, type, method, usagePoint, SN, date) VALUES (?, ?, ?, ?, ?, NOW())`;
      values = [id, '환불', '포인트 환불', point, serialNumber];
      connection.query(sql, values, (err, results) => {
        if(err) throw err;
        if(results.affectedRows > 0) {
          // 이용자 point를 0으로 만들기
          sql = `UPDATE users.info SET point = 0, eventPoint = 0 WHERE id = '${id}'`;
          connection.query(sql, (err, results) => {
            if(err) throw err;
            if(results.affectedRows > 0) {
              res.send({result : 'SUCCESS'});
            } else {
              res.send({result : 'FAIL'});
            }
          });
        }
      });
    } 
  })
});

app.listen(port, ()=> {
    console.log(`server is woriking on Port : ${port}`);
});