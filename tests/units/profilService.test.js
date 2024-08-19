const Profil = require('../../models/Profil');
const ProfilTranslation = require('../../models/ProfilTranslation');
const Language = require('../../models/Language');
const profilService = require('../../services/ProfilService');

jest.mock('../../models/Profil');
jest.mock('../../models/ProfilTranslation');
jest.mock('../../models/Language');

describe('ProfilService', () => {

    afterEach(() => {
        jest.clearAllMocks(); // Nettoie les mocks après chaque test
    });

    describe('create', () => {
        it('should create a new profil with translations', async () => {
            const translations = [
                { isoCode: 'en', label: 'English Label' },
                { isoCode: 'fr', label: 'French Label' }
            ];
            const englishProfil = { label: 'English Label' };
            const newProfil = { _id: '1', ...englishProfil };

            Profil.create.mockResolvedValue(newProfil);
            Language.findOne.mockResolvedValue({ _id: '123' });
            ProfilTranslation.create.mockResolvedValue();

            const result = await profilService.createProfilWithTranslations(translations);

            expect(Profil.create).toHaveBeenCalledWith({ label: 'English Label' });
            expect(ProfilTranslation.create).toHaveBeenCalledTimes(2);
            expect(result).toEqual(newProfil);
        });

        it('should throw an error if creation fails', async () => {
            const error = new Error('Creation failed');
            Profil.create.mockRejectedValue(error);

            await expect(profilService.createProfilWithTranslations([{ isoCode: 'en', label: 'Label' }])).rejects.toThrow('Creation failed');
        });
    });

    describe('getAll', () => {
        it('should return all profils with translations', async () => {
            const profils = [{ _id: '1', label: 'Profil 1' }];
            const translations = [{ label: 'Translation 1', profilId: '1' }];
            const expectedResponse = [{ profil: profils[0], translation: 'Translation 1' }];

            Profil.find.mockResolvedValue(profils);
            ProfilTranslation.find.mockResolvedValue(translations);

            const result = await profilService.getAllProfilsWithTranslations();
            expect(Profil.find).toHaveBeenCalled();
            expect(ProfilTranslation.find).toHaveBeenCalled();
            expect(result).toEqual(expectedResponse);
        });

        it('should throw an error if fetching fails', async () => {
            const error = new Error('Fetching failed');
            Profil.find.mockRejectedValue(error);

            await expect(profilService.getAllProfilsWithTranslations()).rejects.toThrow('Fetching failed');
        });
    });

    describe('getAllByLanguage', () => {
        it('should return all profils with labels in the specified language', async () => {
            const isoCode = 'en';
            const language = { _id: '123' };
            const profils = [{ _id: '1' }];
            const profilTranslations = [{ label: 'English Label', languageId: '123' }];

            Language.findOne.mockResolvedValue(language);
            Profil.find.mockResolvedValue(profils);
            ProfilTranslation.findOne.mockResolvedValue(profilTranslations[0]);

            const result = await profilService.getAllProfilsByLanguage(isoCode);

            expect(Language.findOne).toHaveBeenCalledWith({ isoCode });
            expect(Profil.find).toHaveBeenCalled();
            expect(ProfilTranslation.findOne).toHaveBeenCalled();
            expect(result).toEqual([{ _id: '1', label: 'English Label' }]);
        });

        it('should throw an error if fetching fails', async () => {
            const error = new Error('Fetching failed');
            Language.findOne.mockRejectedValue(error);

            await expect(profilService.getAllProfilsByLanguage('en')).rejects.toThrow('Fetching failed');
        });
    });

    describe('getProfilById', () => {
        it('should return a profil by ID', async () => {
            const profilId = '1';
            const profil = { _id: profilId, label: 'Profil 1' };

            Profil.findById.mockResolvedValue(profil);

            const result = await profilService.getProfilById(profilId);

            expect(Profil.findById).toHaveBeenCalledWith(profilId);
            expect(result).toEqual(profil);
        });

        it('should throw an error if fetching fails', async () => {
            const error = new Error('Fetching failed');
            Profil.findById.mockRejectedValue(error);

            await expect(profilService.getProfilById('1')).rejects.toThrow('Fetching failed');
        });
    });

});
