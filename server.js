var express = require('express')
var cors = require('cors')
var app = express()
const dotenv = require('dotenv');
dotenv.config();

const mysql = require('mysql2');
const QRCode = require('qrcode');
const generatePayload = require('promptpay-qr');
const _ = require('lodash')

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE
});

app.use(cors())
app.use(express.json());

app.get('/pet_adopt', function(req, res) {
    var params = [];
    var sql = 'SELECT pa.*, pp.*, ua.*, a.*, a.Province AS UserProvince, pp.Province AS Province, pp.image AS Image, ua.Image AS UserImage, r.*, l.* FROM pet_adopt pa';
    sql += ' LEFT JOIN pet_profile pp ON pa.Pet_id = pp.Pet_id';
    sql += ' LEFT JOIN user_account ua ON pa.Account_id = ua.Account_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    sql += ' LEFT JOIN login l ON ua.login_id = l.login_id';
    sql += ' LEFT JOIN address a ON r.Address_id = a.Address_id ';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/user_adopt_list', function(req, res) {
    var params = [];
    var sql = 'SELECT al.*, pa.*, pp.*, ua.*, a.*, a.Province AS UserProvince, pp.Province AS Province, pa.Account_id AS OwnerId, ua.Image AS UserImage, pp.image AS PetImage, r.*, l.* FROM user_adopt_list al';
    sql += ' LEFT JOIN pet_adopt pa ON al.Pet_adopt_id = pa.Pet_adopt_id';
    sql += ' LEFT JOIN user_account ua ON al.Account_id = ua.Account_id';
    sql += ' LEFT JOIN pet_profile pp ON pa.Pet_id = pp.Pet_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    sql += ' LEFT JOIN login l ON ua.login_id = l.login_id';
    sql += ' LEFT JOIN address a ON r.Address_id = a.Address_id ';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/contribution', function(req, res) {
    var params = [];
    var sql = 'SELECT c.*, pp.*, ua.*, a.*, a.Province AS UserProvince, pp.Province AS Province, pp.image AS Image, ua.image AS UserImage, r.*, l.* FROM contribution c';
    sql += ' LEFT JOIN pet_profile pp ON c.Pet_id = pp.Pet_id';
    sql += ' LEFT JOIN user_account ua ON c.Account_id = ua.Account_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    sql += ' LEFT JOIN login l ON ua.login_id = l.login_id';
    sql += ' LEFT JOIN address a ON r.Address_id = a.Address_id ';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/pet_lost', function(req, res, next) {
    var params = [];
    var sql = 'SELECT pt.*, pp.*, ua.*, a.*, pp.Province AS UserProvince, a.Province AS UserProvince, pp.Province AS Province, pp.image AS Image, ua.image AS UserImage, r.*, l.* FROM pet_lost pt';
    sql += ' LEFT JOIN pet_profile pp ON pt.Pet_id = pp.Pet_id';
    sql += ' LEFT JOIN user_account ua ON pt.Account_id = ua.Account_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    sql += ' LEFT JOIN login l ON ua.login_id = l.login_id';
    sql += ' LEFT JOIN address a ON r.Address_id = a.Address_id ';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/user_account', function(req, res) {
    var params = [];
    var sql = 'SELECT ua.*, l.*, r.*, a.*, c.* FROM user_account ua';
    sql += ' LEFT JOIN cart c ON ua.Account_id = c.Account_id ';
    sql += ' LEFT JOIN login l ON ua.Login_id = l.Login_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    sql += ' LEFT JOIN address a ON r.Address_id = a.Address_id ';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.listen(5000, function () {
    console.log('CORS-enabled web server listening on port 5000')
})

app.post('/add_pet_adopt', (req, res) => {
    const sqlPetProfile = "INSERT INTO pet_profile (`Pet_name`, `Pet_type_id`, `Color`, `Breed`, `Gender`, `Age`, `Details`, `Image`, `Province`, `Vaccine`, `Castrate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesPetProfile = [
        req.body.Pet_Name,
        req.body.Pet_Type,
        req.body.Color,
        req.body.Breed,
        req.body.Gender,
        req.body.Age,
        req.body.Details,
        req.body.image,
        req.body.Province,
        req.body.Vaccine,
        req.body.Castrate
    ]
    console.log(valuesPetProfile);

    connection.execute(sqlPetProfile, valuesPetProfile, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            const pet_id = result.insertId;
            const postStatus = true;
            const postDateTime = new Date();
            const sqlPetAdopt = 'INSERT INTO pet_adopt (Pet_id, Account_id, Post_status, Post_dateTime) VALUES (?, ?, ?, ?)';
            const valuesPetAdopt = [
                pet_id,
                req.body.Account,
                postStatus,
                postDateTime
            ]
            console.log(valuesPetAdopt);

            connection.execute(sqlPetAdopt, valuesPetAdopt, (err, result) => {
                if (err) {
                    res.json(err);
                } 
            });
        }
    });
});

app.post('/add_pet_lost', (req, res) => {
    const sqlPetProfile = "INSERT INTO pet_profile (`Pet_name`, `Pet_type_id`, `Color`, `Breed`, `Gender`, `Age`, `Details`, `Image`, `Province`, `Vaccine`, `Castrate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesPetProfile = [
        req.body.Pet_Name,
        req.body.Pet_Type,
        req.body.Color,
        req.body.Breed,
        req.body.Gender,
        req.body.Age,
        req.body.Details,
        req.body.image,
        req.body.Province,
        req.body.Vaccine,
        req.body.Castrate
    ]
    console.log(valuesPetProfile);

    connection.execute(sqlPetProfile, valuesPetProfile, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            const pet_id = result.insertId;
            const postStatus = true;
            const postDateTime = new Date();
            const sqlPetLost = 'INSERT INTO pet_lost (Pet_id, Account_id, Post_status, Date_pet_lost, Post_dateTime) VALUES (?, ?, ?, ?, ?)';
            const valuesPetLost = [
                pet_id,
                req.body.Account,
                postStatus,
                req.body.DateLost,
                postDateTime
            ]
            console.log(valuesPetLost);

            connection.execute(sqlPetLost, valuesPetLost, (err, result) => {
                if (err) {
                    res.json(err);
                } 
            });
        }
    });
});

app.post('/add_contribution', (req, res) => {
    const sqlPetProfile = "INSERT INTO pet_profile (`Pet_name`, `Pet_type_id`, `Color`, `Breed`, `Gender`, `Age`, `Details`, `Image`, `Province`, `Vaccine`, `Castrate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesPetProfile = [
        req.body.Pet_Name,
        req.body.Pet_Type,
        req.body.Color,
        req.body.Breed,
        req.body.Gender,
        req.body.Age,
        req.body.Details,
        req.body.image,
        req.body.Province,
        req.body.Vaccine,
        req.body.Castrate
    ]
    console.log(valuesPetProfile);

    connection.execute(sqlPetProfile, valuesPetProfile, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            const pet_id = result.insertId;
            const postStatus = true;
            const TotalMoney = 0;
            const postDateTime = new Date();
            const sqlContribution = 'INSERT INTO contribution (Pet_id, Account_id, Post_status, Total_money, Post_dateTime, Prompt_Pay) VALUES (?, ?, ?, ?, ?, ?)';
            const valuesContribution = [
                pet_id,
                req.body.Account,
                postStatus,
                TotalMoney,
                postDateTime,
                req.body.Prompt_Pay
            ]
            console.log(valuesContribution);

            connection.execute(sqlContribution, valuesContribution, (err, result) => {
                if (err) {
                    res.json(err);
                } 
            });
        }
    });
});

app.delete('/pet_adopt', function (req, res) {
    const { petAdoptId, PetId } = req.body;
    const deletePetAdoptQuery = 'DELETE FROM pet_adopt WHERE Pet_adopt_id = ?';
    const deletePetProfileQuery = 'DELETE FROM pet_profile WHERE Pet_id = ?';
    connection.query(deletePetAdoptQuery, [petAdoptId], function (err, result) {
        if (err) {
            res.json(err);
        } else {
            connection.query(deletePetProfileQuery, [PetId], function (err, result) {
                if (err) {
                    res.json(err);
                }
            });
        }
    });
});

app.delete('/user_adopt_list', function (req, res) {
    const { AdoptListId } = req.body;
    const deleteAdoptListQuery = 'DELETE FROM user_adopt_list WHERE User_adopt_list_id = ?';
    connection.query(deleteAdoptListQuery, [AdoptListId], function (err, result) {
        if (err) {
            res.json(err);
        }
    });
});

app.delete('/pet_lost', function (req, res) {
    const { petLostId, PetId } = req.body;
    const deletePetLostQuery = 'DELETE FROM pet_lost WHERE Pet_lost_id = ?';
    const deletePetProfileQuery = 'DELETE FROM pet_profile WHERE Pet_id = ?';
    connection.query(deletePetLostQuery, [petLostId], function (err, result) {
        if (err) {
            res.json(err);
        } else {
            connection.query(deletePetProfileQuery, [PetId], function (err, result) {
                if (err) {
                    res.json(err);
                }
            });
        }
    });
});

app.delete('/contribution', function (req, res) {
    const { contributionId, PetId } = req.body;
    const deleteContributionQuery = 'DELETE FROM contribution WHERE Contribution_id = ?';
    const deletePetProfileQuery = 'DELETE FROM pet_profile WHERE Pet_id = ?';
    connection.query(deleteContributionQuery, [contributionId], function (err, result) {
        if (err) {
            res.json(err);
        } else {
            connection.query(deletePetProfileQuery, [PetId], function (err, result) {
                if (err) {
                    res.json(err);
                }
            });
        }
    });
});

app.post('/update_pet_post', function (req, res) {
    const updatePetProfile = "UPDATE pet_profile SET `Pet_name` = ?, `Pet_type_id` = ?, `Color` = ?, `Breed` = ?, `Gender` = ?, `Age` = ?, `Details` = ?, `Image` = ?, `Province` = ?, `Vaccine` = ?, `Castrate` = ? WHERE Pet_id = ?";
    const valuesPetProfile = [
        req.body.Pet_Name,
        req.body.Pet_Type,
        req.body.Color,
        req.body.Breed,
        req.body.Gender,
        req.body.Age,
        req.body.Details,
        req.body.image,
        req.body.Province,
        req.body.Vaccine,
        req.body.Castrate,
        req.body.Pet_id
    ];
    console.log(valuesPetProfile);

    connection.execute(updatePetProfile, valuesPetProfile, function (err, results) {
        if (err) {
            res.json(err);
        } else {
            if (req.body.PetLost_id) {
                const updatePetLost = "UPDATE pet_lost SET `Date_pet_lost` = ?, `Post_status` = ? WHERE Pet_lost_id = ?";
                const valuesPetLost = [
                    req.body.DateLost,
                    req.body.Status,
                    req.body.PetLost_id
                ];
                console.log(valuesPetLost);
                connection.execute(updatePetLost, valuesPetLost, function (err, results) {
                    if (err) {
                        res.json(err);
                    }
                });
            } else if (req.body.PetAdopt_id) {
                const updatePetAdopt = "UPDATE pet_adopt SET `Post_status` = ? WHERE Pet_adopt_id = ?";
                const valuesPetAdopt = [
                    req.body.Status,
                    req.body.PetAdopt_id
                ];
                console.log(valuesPetAdopt);
                connection.execute(updatePetAdopt, valuesPetAdopt, function (err, results) {
                    if (err) {
                        res.json(err);
                    }
                });
            } else if (req.body.Contribution_id) {
                const updateContribution = "UPDATE contribution SET `Post_status` = ?, `Prompt_Pay` = ? WHERE Contribution_id = ?";
                const valuesContribution = [
                    req.body.Status,
                    req.body.Prompt_Pay,
                    req.body.Contribution_id
                ];
                console.log(valuesContribution);
                connection.execute(updateContribution, valuesContribution, function (err, results) {
                    if (err) {
                        res.json(err);
                    }
                });
            }
        }
    });
});

app.delete('/user_account', function (req, res) {
    const { AccountId, LoginId, RegisterId, AddressId, CartId } = req.body;
    const deleteLoginQuery = 'DELETE FROM login WHERE Login_id = ?';
    const deleteAddressQuery = 'DELETE FROM address WHERE Address_id = ?';
    const deleteRegisterQuery = 'DELETE FROM register WHERE Register_id = ?';
    const deleteCartQuery = 'DELETE FROM cart WHERE Cart_id = ?';
    const deleteAccountQuery = 'DELETE FROM user_account WHERE Account_id = ?';
    connection.query(deleteCartQuery, [CartId], function (err, result) {
        if (err) {
            res.json(err);
        } else {
            connection.query(deleteAccountQuery, [AccountId], function (err, result) {
                if (err) {
                    res.json(err);
                } else {
                    connection.query(deleteRegisterQuery, [RegisterId], function (err, result) {
                        if (err) {
                            res.json(err);
                        } else {
                            connection.query(deleteAddressQuery, [AddressId], function (err, result) {
                                if (err) {
                                    res.json(err);
                                } else {
                                    connection.query(deleteLoginQuery, [LoginId], function (err, result) {
                                        if (err) {
                                            res.json(err);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

app.get('/admin_login', function(req, res) {
    var params = [];
    var sql = 'SELECT a.* FROM admim a';

    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.post('/register', (req, res) => {
    const sqlAddress = "INSERT INTO address (`House_id`, `Alley`, `District`, `County`, `Province`, `Postal_id`) VALUES (?, ?, ?, ?, ?, ?)";
    const valuesAddress = [
        req.body.House_id,
        req.body.Alley,
        req.body.District,
        req.body.County,
        req.body.Province,
        req.body.Postal_id
    ]
    console.log(valuesAddress);

    connection.execute(sqlAddress, valuesAddress, (err, addressResult) => {
        if (err) {
            res.json(err);
        } else {
            const addressId = addressResult.insertId;
            const sqlLogin = "INSERT INTO login (`Email`, `Password`) VALUES (?, ?)";
            const valuesLogin = [
                req.body.Email,
                req.body.Password
            ]
            console.log(valuesLogin);
            connection.execute(sqlLogin, valuesLogin, (err, loginResult) => {
                if (err) {
                    res.json(err);
                } else {
                    const loginId = loginResult.insertId;
                    const sqlRegister = "INSERT INTO register (`Name`, `Surname`, `National_id`, `Telephone`, `Address_id`, `Login_id`) VALUES (?, ?, ?, ?, ?, ?)";
                    const valuesLogin = [
                        req.body.Name,
                        req.body.Surname,
                        req.body.National_id,
                        req.body.Telephone,
                        addressId,
                        loginId
                    ]
                    console.log(valuesLogin);
                    connection.execute(sqlRegister, valuesLogin, (err, registerResult) => {
                        if (err) {
                            res.json(err);
                        } else {
                            const registerId = registerResult.insertId;
                            const Status = 'ใช้งาน';
                            const Image = '/src/assets/img/Account.jpg'
                            const sqlAccount = "INSERT INTO user_account (`Login_id`, `Register_id`, `Status`, `Image`) VALUES (?, ?, ?, ?)";
                            const valuesAccount = [
                                loginId,
                                registerId,
                                Status,
                                Image
                            ]
                            console.log(valuesAccount);
                            connection.execute(sqlAccount, valuesAccount, (err, accountResult) => {
                                if (err) {
                                    res.json(err);
                                } else {
                                    const accountId = accountResult.insertId;
                                    const sqlCart = "INSERT INTO cart (`Account_id`) VALUES (?)";
                                    const valuesCart = [
                                        accountId
                                    ]
                                    connection.execute(sqlCart, valuesCart, (err, Result) => {
                                        if (err) {
                                            res.json(err);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

app.post('/update_image', function (req, res) {
    const updateImage = "UPDATE user_account SET `Image` = ? WHERE Account_id = ?";
    const valuesImage = [
        req.body.image,
        req.body.Account_id
    ];
    console.log(valuesImage);

    connection.execute(updateImage, valuesImage, function (err, results) {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/update_adopt_list', function (req, res) {
    const updateListStatus = "UPDATE user_adopt_list SET `List_pet_status` = ?, `Adopt_date` = ? WHERE User_adopt_list_id = ?";
    const updateOwnerStatus = "UPDATE user_adopt_list SET `Owner_status` = ? WHERE User_adopt_list_id = ?";
    const updateUserStatus = "UPDATE user_adopt_list SET `User_status` = ? WHERE User_adopt_list_id = ?";
    if (req.body.ListPetStatus) {
        const valuesListStatus = [
            req.body.ListPetStatus,
            req.body.AdoptDate,
            req.body.AdoptListId
        ];
        console.log(valuesListStatus);
    
        connection.execute(updateListStatus, valuesListStatus, function (err, results) {
            if (err) {
                res.json(err);
            } else {
                const updatePetAdopt = "UPDATE pet_adopt SET `Post_status` = ? WHERE Pet_adopt_id = ?";
                const valuesPetAdopt = [
                    req.body.Status,
                    req.body.PetAdopt_id
                ];
                console.log(valuesPetAdopt);
                connection.execute(updatePetAdopt, valuesPetAdopt, function (err, results) {
                    if (err) {
                        res.json(err);
                    }
                });
            }
        });
    } else if (req.body.OwnerStatus) {
        const valuesOwnerStatus = [
            req.body.OwnerStatus,
            req.body.AdoptListId
        ];
        console.log(valuesOwnerStatus);
    
        connection.execute(updateOwnerStatus, valuesOwnerStatus, function (err, results) {
            if (err) {
                res.json(err);
            }
        });
    } else if (req.body.UserStatus) {
        const valuesUserStatus = [
            req.body.UserStatus,
            req.body.AdoptListId
        ];
        console.log(valuesUserStatus);
    
        connection.execute(updateUserStatus, valuesUserStatus, function (err, results) {
            if (err) {
                res.json(err);
            }
        });
    }
});


app.post('/user_adopt_list', (req, res) => {
    const sqlAdoptList = "INSERT INTO user_adopt_list (`Account_id`, `Pet_adopt_id`, `List_pet_status`, `Adopt_date`, `User_status`, `Owner_status`) VALUES (?, ?, ?, ?, ?, ?)";
    const valuesAdoptList = [
        req.body.AccountId,
        req.body.PetAdoptId,
        req.body.ListPetStatus,
        req.body.AdoptDate,
        req.body.UserStatus,
        req.body.OwnerStatus
    ]
    console.log(valuesAdoptList);

    connection.execute(sqlAdoptList, valuesAdoptList, (err, result) => {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/update_user_account', function (req, res) {
    const updateUserStatus = "UPDATE user_account SET `Status` = ? WHERE Account_id = ?";
    const valuesUserStatus = [
        req.body.Status,
        req.body.AccountId
    ]
    connection.execute(updateUserStatus, valuesUserStatus, function (err, results) {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/update_status_petLost', function (req, res) {
    const updatePetLost = "UPDATE pet_lost SET `Post_status` = ? WHERE Pet_lost_id = ?";
    const valuesPetLost = [
        req.body.PostStatus,
        req.body.PetLostId
    ];
    console.log(valuesPetLost);

    connection.execute(updatePetLost, valuesPetLost, function (err, results) {
        if (err) {
            res.json(err);
        }
    });
});


app.post('/update_status_contribution', function (req, res) {
    const updateContribution = "UPDATE contribution SET `Post_status` = ? WHERE Contribution_id = ?";
    const valuesContribution = [
        req.body.PostStatus,
        req.body.ContributionId
    ];
    console.log(valuesContribution);

    connection.execute(updateContribution, valuesContribution, function (err, results) {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/add_contribution_details', (req, res) => {
    const sqlContributionDetails = "INSERT INTO contribution_details (`Contribution_id`, `Account_id`, `Money`) VALUES (?, ?, ?)";
    const updateContribution = "UPDATE contribution SET `Total_money` = ? WHERE Contribution_id = ?";
    const valuesContributionDetails = [
        req.body.ContributionId,
        req.body.AccountId,
        req.body.Money,
    ]
    const valuesContribution = [
        req.body.TotalMoney,
        req.body.ContributionId,
    ]

    connection.execute(sqlContributionDetails, valuesContributionDetails, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            connection.execute(updateContribution, valuesContribution, (err, result) => {
                if (err) {
                    res.json(err);
                }
            });
        }
    });
});

app.get('/contribution_details', function(req, res) {
    var params = [];
    var sql = 'SELECT cd.*, c.*, pp.*, ua.*, pp.image AS Image, ua.image AS UserImage, r.* FROM contribution_details cd';
    sql += ' LEFT JOIN contribution c ON cd.Contribution_id = c.Contribution_id';
    sql += ' LEFT JOIN pet_profile pp ON c.Pet_id = pp.Pet_id';
    sql += ' LEFT JOIN user_account ua ON cd.Account_id = ua.Account_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/chat_room', function(req, res) {
    var params = [];
    var sql = 'SELECT cr.*, ua1.*, ua2.*, r1.*, l1.*, r2.*, l2.*, r1.Name AS Name1, r1.Surname AS Surname1, ua1.Image AS Image1, r2.Name AS Name2, r2.Surname AS Surname2, ua2.Image AS Image2';
    sql += ' FROM chat_room cr';
    sql += ' LEFT JOIN user_account ua1 ON cr.Account1_id = ua1.Account_id';
    sql += ' LEFT JOIN user_account ua2 ON cr.Account2_id = ua2.Account_id';
    sql += ' LEFT JOIN register r1 ON ua1.Register_id = r1.Register_id';
    sql += ' LEFT JOIN login l1 ON ua1.login_id = l1.login_id';
    sql += ' LEFT JOIN register r2 ON ua2.Register_id = r2.Register_id';
    sql += ' LEFT JOIN login l2 ON ua2.login_id = l2.login_id';
    connection.execute(sql, params, function (err, results) {
        res.json({ data: results });
    });
});

app.post('/chat_room', (req, res) => {
    const sqlChatRoom = "INSERT INTO chat_room (`Account1_id`, `Account2_id`) VALUES (?, ?)";
    const valuesChatRoom = [
        req.body.Account1_id,
        req.body.Account2_id
    ]
    connection.execute(sqlChatRoom, valuesChatRoom, (err, result) => {
        if (err) {
            res.json(err);
        }
    });
});

app.get('/user_messages', function(req, res) {
    var params = [];
    var sql = 'SELECT um.*, cr.*';
    sql += ' FROM user_messages um';
    sql += ' LEFT JOIN chat_room cr ON um.Chat_room_id = cr.Chat_room_id';
    connection.execute(sql, params, function (err, results) {
        res.json({ data: results });
    });
});

app.post('/user_messages', (req, res) => {
    const sqlUserMessages = "INSERT INTO user_messages (`Chat_room_id`, `Messages_userId`, `Messages_text`, `Messages_image`, `Sent_dateTime`, `isRead`) VALUES (?, ?, ?, ?, ?, ?)";
    const SentDataTime = new Date();
    const isRead = 1;
    const valuesUserMessages = [
        req.body.ChatRoomId,
        req.body.MessagesUserId,
        req.body.MessagesText,
        req.body.MessagesImage,
        SentDataTime,
        isRead
    ]
    console.log(valuesUserMessages)
    connection.execute(sqlUserMessages, valuesUserMessages, (err, result) => {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/update_messages', function (req, res) {
    const updateUserMessages = "UPDATE user_messages SET `isRead` = ? WHERE Chat_room_id IN (?) AND Messages_userId IN (?)";
    const valuesUserMessages = [
        req.body.isRead,
        req.body.ChatRoomId,
        req.body.AccountId
    ];

    connection.execute(updateUserMessages, valuesUserMessages, function (err, results) {
        if (err) {
            res.json(err);
        }
    });
});

app.get('/shop_post', function(req, res) {
    var params = [];
    var sql = 'SELECT sp.*, s.*, prt.*, pt.* FROM shop_post sp';
    sql += ' LEFT JOIN supplier s ON sp.Supplier_id = s.Supplier_id';
    sql += ' LEFT JOIN product_type prt ON sp.Product_type_id = prt.Product_type_id';
    sql += ' LEFT JOIN pet_type pt ON prt.Pet_type_id = pt.Pet_type_id';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/supplier', function(req, res) {
    var params = [];
    var sql = 'SELECT s.* FROM supplier s';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/product_type', function(req, res) {
    var params = [];
    var sql = 'SELECT prt.*, pt.* FROM product_type prt';
    sql += ' LEFT JOIN pet_type pt ON prt.Pet_type_id = pt.Pet_type_id';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.delete('/shop_post', function (req, res) {
    const ShopPostId = req.body.ShopPostId;
    const deleteShopPost = 'DELETE FROM shop_post WHERE Shop_post_id = ?';
    connection.query(deleteShopPost, [ShopPostId], function (err, result) {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/add_supplier', (req, res) => {
    const sqlSupplier = "INSERT INTO supplier (`Supplier_name`, `ContactUs`) VALUES (?, ?)";
    const valuesSupplier = [
        req.body.SupplierName,
        req.body.ContactUs
    ]
    connection.execute(sqlSupplier, valuesSupplier, (err, result) => {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/add_shop_post', (req, res) => {
    const sqlShopPost = "INSERT INTO shop_post (`Product_name`, `Supplier_id`, `Product_type_id`, `Price`, `Product_quantity`, `Product_Image`, `Product_details`, `Post_status`, `Post_start`, `Post_end`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const PostStatus = 1;
    const valuesShopPost = [
        req.body.ProductName,
        req.body.SupplierId,
        req.body.ProductTypeId,
        req.body.Price,
        req.body.ProductQuantity,
        req.body.ProductImage,
        req.body.ProductDetails,
        PostStatus,
        req.body.PostStart,
        req.body.PostEnd,
    ]
    connection.execute(sqlShopPost, valuesShopPost, (err, result) => {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/update_shop_post', function (req, res) {
    const updateShopPost = "UPDATE shop_post SET `Product_name` = ?, `Supplier_id` = ?, `Product_type_id` = ?, `Price` = ?, `Product_quantity` = ?, `Product_Image` = ?, `Product_details` = ?, `Post_status` = ?, `Post_start` = ?, `Post_end` = ? WHERE Shop_post_id = ?";
    const valuesShopPost = [
        req.body.ProductName,
        req.body.SupplierId,
        req.body.ProductTypeId,
        req.body.Price,
        req.body.ProductQuantity,
        req.body.ProductImage,
        req.body.ProductDetails,
        req.body.PostStatus,
        req.body.PostStart,
        req.body.PostEnd,
        req.body.ShopPostId
    ]
    connection.execute(updateShopPost, valuesShopPost, function (err, results) {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/add_cart_details', (req, res) => {
    const sqlCartDetails = "INSERT INTO cart_details (`Cart_id`, `Shop_post_id`, `Quantity`, `Total_price`, `Cart_status`) VALUES (?, ?, ?, ?, ?)";
    const cartStatus = 1
    const valuesCartDetails = [
        req.body.CartID,
        req.body.ShopPostId,
        req.body.Quantity,
        req.body.TotalPrice,
        cartStatus
    ]
    connection.execute(sqlCartDetails, valuesCartDetails, (err, result) => {
        if (err) {
            res.json(err);
        }
    });
});

app.get('/cart', function(req, res) {
    var params = [];
    var sql = 'SELECT c.* FROM cart c';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.get('/cart_details', function(req, res) {
    var params = [];
    var sql = 'SELECT cd.*, sp.*, c.*, ua.*, r.* FROM cart_details cd';
    sql += ' LEFT JOIN shop_post sp ON cd.Shop_post_id = sp.Shop_post_id';
    sql += ' LEFT JOIN cart c ON cd.Cart_id = c.Cart_id';
    sql += ' LEFT JOIN user_account ua ON c.Account_id = ua.Account_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.delete('/cart_details', function (req, res) {
    const sqlCartDetails = req.body.CartDetailsId;
    const deleteCartDetails = 'DELETE FROM cart_details WHERE Cart_Details_id = ?';
    connection.query(deleteCartDetails, [sqlCartDetails], function (err, result) {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/update_quantity', function (req, res) {
    const updateShopPost = "UPDATE shop_post SET `Product_quantity` = ? WHERE Shop_post_id = ?";
    const updateData = req.body.updateData;
    updateData.forEach((update) => {
        const valuesShopPost = [update.ProductQuantity, update.ShopPostId];
        try {
            const results = connection.execute(updateShopPost, valuesShopPost);
        } catch (err) {
            res.json(err);
        }
    });
});

app.post('/update_cart_details', function (req, res) {
    const updateCartDetails = "UPDATE cart_details SET `Cart_status` = ? WHERE Cart_Details_id = ?";
    if (req.body.Check) {
        const valuesCartDetails = [
            req.body.CartStatus,
            req.body.CartDetailsId
        ]
        connection.execute(updateCartDetails, valuesCartDetails, function (err, results) {
            if (err) {
                res.json(err);
            }
        });
    } else {
        const updateCart= req.body.updateCartDetails;
        updateCart.forEach((update) => {
            const valuesCartDetails = [update.CartStatus, update.CartDetailsId];
            try {
                const results = connection.execute(updateCartDetails, valuesCartDetails);
            } catch (err) {
                res.json(err);
            }
        });
    }
});

app.get('/help_post', function(req, res) {
    var params = [];
    var sql = 'SELECT hp.*, ua.*, r.* FROM help_post hp';
    sql += ' LEFT JOIN user_account ua ON hp.Account_id = ua.Account_id';
    sql += ' LEFT JOIN register r ON ua.Register_id = r.Register_id';
    connection.execute(sql, params, function (err, results) {
        console.log(results);
        res.json({ data: results });
    });
});

app.post('/add_help_post', (req, res) => {
    const sqlHelpPost = "INSERT INTO help_post (`Account_id`, `Topic_name`, `Help_details`, `Help_image`) VALUES (?, ?, ?, ?)";
    const valuesHelpPost = [
        req.body.AccountId,
        req.body.TopicName,
        req.body.HelpDetails,
        req.body.HelpImage,
    ]
    connection.execute(sqlHelpPost, valuesHelpPost, (err, result) => {
        if (err) {
            res.json(err);
        }
    });
});

app.delete('/help_post', function (req, res) {
    const sqlHelpPost = req.body.helpId;
    const deleteHelpPost = 'DELETE FROM help_post WHERE Help_post_id = ?';
    connection.query(deleteHelpPost, [sqlHelpPost], function (err, result) {
        if (err) {
            res.json(err);
        }
    });
});

app.post('/generateQR', (req, res) => {
    const amount = parseFloat(req.body.Money);
    const promptPay = req.body.promptPay;
    const page = req.body.page;
    let mobileNumber;
    if (page === 1) {
        mobileNumber = promptPay;
    } else {
        mobileNumber = '0863757359';
    };
    const payload = generatePayload(mobileNumber, { amount });
    const options = {
        color: {
            dark: '#000',
            light: '#fff'
        }
    }
    QRCode.toDataURL(payload, options, (err, url) => {
        if (err) {
            return res.status(400).json({ RespCode: 400, RespMessage: 'bad : ' + err });
        } else {
            res.status(200).json({ RespCode: 200, RespMessage: 'good', Result: url });
        }
    })
});

app.post('/reset_password', function (req, res) {
    const updatePassword = "UPDATE login SET `Password` = ? WHERE Email = ?";
    const valuesPassword = [
        req.body.Password,
        req.body.Email
    ];
    console.log(valuesPassword)
    connection.execute(updatePassword, valuesPassword, function (err, results) {
        if (err) {
            res.json(err);
        }
    });
});