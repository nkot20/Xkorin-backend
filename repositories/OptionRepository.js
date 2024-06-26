const Option = require("../models/Option");
const Language = require("../models/Language");
const OptionTranslation = require("../models/OptionTranslation");
const Proposition = require("../models/Proposition");
const PropositionTranslation = require("../models/PropositionTranslation");

class OptionRepository {

    async create(payload, translations) {
        try {
            const englishProposition = translations.filter(proposition => proposition.isoCode === 'en');
            const option = await Option.create({label: englishProposition[0].label, value: payload.value});
            await Promise.all(translations.map(async (optionTranslation) => {
                const language = await Language.findOne({ isoCode: optionTranslation.isoCode });
                if (language) {
                    await OptionTranslation.create({ label: optionTranslation.label, languageId: language._id, optionId: option._id });
                    return language._id;
                }
            }));
            return option;
        } catch (error) {
            console.error("Erreur lors de l'ajout du de la proposition: ", error);
            throw error;
        }
    }

    async getAllByIsoCodeLanguage(isoCode) {
        try {
            const options = await Option.find().sort({createdAt: -1});
            let response = [];
            const language = await Language.findOne({isoCode});
            await Promise.all(options.map(async (option) => {
                const optionTranslation = await OptionTranslation.findOne({optionId: option._id, languageId: language._id});
                option.label = optionTranslation.label;
                response.push(option);
            }));
            const optionsImportant = (response.filter((option) => option.isItImportant)).reverse();
            const optionsNotImportant = (response.filter((option) => !(option.isItImportant))).reverse();
            return {optionsImportant, optionsNotImportant};
        } catch (error) {
            throw error;
        }
    }


}

const optionRepository = new OptionRepository();
module.exports = optionRepository;

[
    {
        "imprint": {
            "_id": "663a05d5c986d59858066ea9",
            "name": "Vulnerabilty",
            "number": 1,
            "createdAt": "2024-05-07T10:43:33.762Z",
            "updatedAt": "2024-05-07T10:43:33.762Z",
            "__v": 0
        },
        "variables": []
    },
    {
        "imprint": {
            "_id": "6637a43d72e10eed26cd7d62",
            "name": "Wellbeing",
            "number": 5,
            "createdAt": "2024-05-05T15:22:37.135Z",
            "updatedAt": "2024-05-05T15:22:37.135Z",
            "__v": 0
        },
        "variables": [
            {
                "_id": "6644aeacf3d70743070a4808",
                "name": "Working Conditions",
                "lastChildren": [
                    {
                        "_id": "66508e1d1c9a817b60725839",
                        "name": "Spillover",
                        "questions": [
                            {
                                "_id": "66522a6181181b890ccb82c3",
                                "label": "How important will the spillover of my job on my privet life ?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "66508e1d1c9a817b60725839",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-05-25T18:13:53.034Z",
                                "updatedAt": "2024-05-25T18:13:53.034Z",
                                "__v": 0
                            },
                            {
                                "_id": "66523fc6d45332c4d04f8a21",
                                "label": "For my early career, the spillover of my job on my private life will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "66508e1d1c9a817b60725839",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-05-25T19:45:10.747Z",
                                "updatedAt": "2024-05-25T19:45:10.747Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "665f47f28e6a2e9d76b74b1b",
                        "name": "Workload",
                        "questions": [
                            {
                                "_id": "665f48268e6a2e9d76b74b57",
                                "label": "For my early career, the spillover of my job on my private life will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "665f47f28e6a2e9d76b74b1b",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-04T17:00:22.503Z",
                                "updatedAt": "2024-06-04T17:00:22.503Z",
                                "__v": 0
                            },
                            {
                                "_id": "665f48748e6a2e9d76b74b62",
                                "label": "How important will be my workload ?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "665f47f28e6a2e9d76b74b1b",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-04T17:01:40.170Z",
                                "updatedAt": "2024-06-04T17:01:40.170Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "665f4d318e6a2e9d76b74c53",
                        "name": "Hierarchical pressure",
                        "questions": [
                            {
                                "_id": "665f4d6f8e6a2e9d76b74c90",
                                "label": "For my early career, the presure from hierarchy in my enterprise will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "665f4d318e6a2e9d76b74c53",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-04T17:22:55.854Z",
                                "updatedAt": "2024-06-04T17:22:55.854Z",
                                "__v": 0
                            },
                            {
                                "_id": "666033d28e6a2e9d76b74cb2",
                                "label": "The presure from hierarchy in my enterprise will be",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "665f4d318e6a2e9d76b74c53",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-05T09:45:54.753Z",
                                "updatedAt": "2024-06-05T09:45:54.753Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "66603f138e6a2e9d76b7507c",
                        "name": "Non-financial benefits",
                        "questions": [
                            {
                                "_id": "66603f9e8e6a2e9d76b750bd",
                                "label": "For my early career, the level of recognition expressed towards you at my enterprise will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "66603f138e6a2e9d76b7507c",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-05T10:36:14.158Z",
                                "updatedAt": "2024-06-05T10:36:14.158Z",
                                "__v": 0
                            },
                            {
                                "_id": "666043a88e6a2e9d76b752f9",
                                "label": "How important are the incentives apart from my salary, (nonfinancial benefits) which I enjoy from my enterprise ?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "66603f138e6a2e9d76b7507c",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-05T10:53:28.024Z",
                                "updatedAt": "2024-06-05T10:53:28.024Z",
                                "__v": 0
                            }
                        ]
                    }
                ]
            },
            {
                "_id": "6644af07f3d70743070a481c",
                "name": "Working Methods",
                "lastChildren": [
                    {
                        "_id": "665465159be0fedf68e2b143",
                        "name": "Scoop of control",
                        "questions": [
                            {
                                "_id": "6654659c9be0fedf68e2b184",
                                "label": "For my early career, my scope of control will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "665465159be0fedf68e2b143",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-05-27T10:51:08.457Z",
                                "updatedAt": "2024-05-27T10:51:08.457Z",
                                "__v": 0
                            },
                            {
                                "_id": "665466bd9be0fedf68e2b1e7",
                                "label": "How important will be my scope of control ?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "665465159be0fedf68e2b143",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-05-27T10:55:57.860Z",
                                "updatedAt": "2024-05-27T10:55:57.860Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "6674676e4fce827641b03756",
                        "name": "The goal-setting process",
                        "questions": [
                            {
                                "_id": "667467c74fce827641b037dd",
                                "label": "For my early career, the process of determining my objectives will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "6674676e4fce827641b03756",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T17:32:55.856Z",
                                "updatedAt": "2024-06-20T17:32:55.856Z",
                                "__v": 0
                            },
                            {
                                "_id": "6674682a4fce827641b037f2",
                                "label": "How important will be the the process for the determination of my objectives?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "6674676e4fce827641b03756",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T17:34:34.420Z",
                                "updatedAt": "2024-06-20T17:34:34.420Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "66746af04fce827641b03964",
                        "name": "Youth assessment method",
                        "questions": [
                            {
                                "_id": "66746c274fce827641b03a38",
                                "label": "Currrently, the manner in which I am evaluated will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "66746af04fce827641b03964",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T17:51:35.948Z",
                                "updatedAt": "2024-06-20T17:51:35.948Z",
                                "__v": 0
                            },
                            {
                                "_id": "66746dae4fce827641b03b2e",
                                "label": "How important will be the method used for evaluation of employees in my enterprice ?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "66746af04fce827641b03964",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T17:58:06.896Z",
                                "updatedAt": "2024-06-20T17:58:06.896Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "66746b354fce827641b039a7",
                        "name": "Continuous training policy",
                        "questions": [
                            {
                                "_id": "66746c964fce827641b03a81",
                                "label": "For my early career our continuous improvment training policy will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "66746b354fce827641b039a7",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T17:53:26.532Z",
                                "updatedAt": "2024-06-20T17:53:26.532Z",
                                "__v": 0
                            },
                            {
                                "_id": "66746e494fce827641b03b7d",
                                "label": "How important will be the current continous improvement training policy of my enterprise?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "66746b354fce827641b039a7",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T18:00:41.469Z",
                                "updatedAt": "2024-06-20T18:00:41.469Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "66746b964fce827641b039eb",
                        "name": "Grade attribution process",
                        "questions": [
                            {
                                "_id": "66746ccc4fce827641b03aca",
                                "label": "Currentlt the process of treating and rankind employees salaries in our enterprise will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "66746b964fce827641b039eb",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T17:54:20.842Z",
                                "updatedAt": "2024-06-20T17:54:20.842Z",
                                "__v": 0
                            },
                            {
                                "_id": "66746d2d4fce827641b03adf",
                                "label": "How important will be the, the process for the elaboration of salaries at my enterprise?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "66746b964fce827641b039eb",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-20T17:55:57.657Z",
                                "updatedAt": "2024-06-20T17:55:57.657Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "667469504fce827641b038a1",
                        "name": "In-house procedures",
                        "questions": [
                            {
                                "_id": "66758d19e1881a2f3a1bb83e",
                                "label": "For my early career our internal processes will be",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "667469504fce827641b038a1",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-21T14:24:25.586Z",
                                "updatedAt": "2024-06-21T14:24:25.586Z",
                                "__v": 0
                            },
                            {
                                "_id": "66758ecae1881a2f3a1bb9b3",
                                "label": "How important are the internal rules and regulations at my enterprise?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "667469504fce827641b038a1",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-21T14:31:38.577Z",
                                "updatedAt": "2024-06-21T14:31:38.577Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "667469924fce827641b038e1",
                        "name": "Decision-making process",
                        "questions": [
                            {
                                "_id": "66758d6ce1881a2f3a1bb893",
                                "label": "For my early career our decision making process will be :",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "667469924fce827641b038e1",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-21T14:25:48.681Z",
                                "updatedAt": "2024-06-21T14:25:48.681Z",
                                "__v": 0
                            },
                            {
                                "_id": "66758e6fe1881a2f3a1bb958",
                                "label": "How important will be the decision-making process at my enterprise?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "667469924fce827641b038e1",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-21T14:30:07.462Z",
                                "updatedAt": "2024-06-21T14:30:07.462Z",
                                "__v": 0
                            }
                        ]
                    },
                    {
                        "_id": "66746a0b4fce827641b03922",
                        "name": "Corporate communication",
                        "questions": [
                            {
                                "_id": "66758da0e1881a2f3a1bb8e8",
                                "label": "For my early career, the quality of communication in my cnterprise will be :",
                                "type": "radio",
                                "weighting": false,
                                "variableId": "66746a0b4fce827641b03922",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-21T14:26:40.039Z",
                                "updatedAt": "2024-06-21T14:26:40.039Z",
                                "__v": 0
                            },
                            {
                                "_id": "66758dd9e1881a2f3a1bb8fd",
                                "label": "How important will be the quality of the communication in my enterprise?",
                                "type": "radio",
                                "weighting": true,
                                "variableId": "66746a0b4fce827641b03922",
                                "profilId": "664f24421c9a817b6072576f",
                                "createdAt": "2024-06-21T14:27:37.731Z",
                                "updatedAt": "2024-06-21T14:27:37.731Z",
                                "__v": 0
                            }
                        ]
                    }
                ]
            },
        ]
    }
]