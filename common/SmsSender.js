import twilio from 'twilio';

const SettingService = require('../services/SettingService');

module.exports = class SmsSenderClass {
  static async SmsSender(body, from, to) {
    try {
      const settingData = await SettingService.list();
      const twilioData = {};
      for (let i = 0; i <= settingData.length - 1; i++) {
        twilioData[[settingData[i].key]] = settingData[i].value;
      }

      // twilio  Setting
      const accountSid = !('setting_twilio_account_sid' in twilioData) ? '' : twilioData.setting_twilio_account_sid;
      const authToken = !('setting_twilio_auth_token' in twilioData) ? '' : twilioData.setting_twilio_auth_token;

      const client = twilio(accountSid, authToken);
      return await client.messages.create({
        body,
        from,
        to,
      });
    } catch (error) {
      console.log('sms Send error', error);
      throw error;
    }
  }
};
