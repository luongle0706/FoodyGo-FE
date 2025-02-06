
import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    generalSettings: {
      siteName: 'FoodyGo',
      siteDescription: 'Platform for food delivery',
      contactEmail: 'admin@foodygo.com',
      phoneNumber: '+84 123 456 789'
    },
    emailSettings: {
      smtpServer: 'smtp.example.com',
      smtpPort: '587',
      smtpUsername: 'noreply@foodygo.com',
      smtpPassword: '********'
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      orderNotifications: true,
      marketingEmails: false
    },
    securitySettings: {
      twoFactorAuth: true,
      passwordExpiration: '90',
      sessionTimeout: '30',
      ipWhitelist: ''
    }
  });

  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      generalSettings: {
        ...prev.generalSettings,
        [name]: value
      }
    }));
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        [name]: value
      }
    }));
  };

  const handleNotificationToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [setting]: !prev.notificationSettings[setting]
      }
    }));
  };

  const handleSecuritySettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      securitySettings: {
        ...prev.securitySettings,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Saving settings:', settings);
  };

  return (
    <div className="settings-page">
      <h2>Cài đặt hệ thống</h2>

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="settings-section">
          <h3>Cài đặt chung</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label htmlFor="siteName">Tên trang web</label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={settings.generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="siteDescription">Mô tả</label>
              <input
                type="text"
                id="siteDescription"
                name="siteDescription"
                value={settings.generalSettings.siteDescription}
                onChange={handleGeneralSettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactEmail">Email liên hệ</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={settings.generalSettings.contactEmail}
                onChange={handleGeneralSettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Số điện thoại</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={settings.generalSettings.phoneNumber}
                onChange={handleGeneralSettingsChange}
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="settings-section">
          <h3>Cài đặt Email</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label htmlFor="smtpServer">SMTP Server</label>
              <input
                type="text"
                id="smtpServer"
                name="smtpServer"
                value={settings.emailSettings.smtpServer}
                onChange={handleEmailSettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="smtpPort">SMTP Port</label>
              <input
                type="text"
                id="smtpPort"
                name="smtpPort"
                value={settings.emailSettings.smtpPort}
                onChange={handleEmailSettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="smtpUsername">SMTP Username</label>
              <input
                type="text"
                id="smtpUsername"
                name="smtpUsername"
                value={settings.emailSettings.smtpUsername}
                onChange={handleEmailSettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="smtpPassword">SMTP Password</label>
              <input
                type="password"
                id="smtpPassword"
                name="smtpPassword"
                value={settings.emailSettings.smtpPassword}
                onChange={handleEmailSettingsChange}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h3>Cài đặt thông báo</h3>
          <div className="settings-grid">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                />
                Thông báo qua email
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.pushNotifications}
                  onChange={() => handleNotificationToggle('pushNotifications')}
                />
                Thông báo đẩy
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.orderNotifications}
                  onChange={() => handleNotificationToggle('orderNotifications')}
                />
                Thông báo đơn hàng
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.marketingEmails}
                  onChange={() => handleNotificationToggle('marketingEmails')}
                />
                Email marketing
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <h3>Cài đặt bảo mật</h3>
          <div className="settings-grid">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.securitySettings.twoFactorAuth}
                  onChange={(e) => handleSecuritySettingsChange({
                    target: {
                      name: 'twoFactorAuth',
                      value: e.target.checked
                    }
                  })}
                />
                Xác thực 2 lớp
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="passwordExpiration">Thời hạn mật khẩu (ngày)</label>
              <input
                type="number"
                id="passwordExpiration"
                name="passwordExpiration"
                value={settings.securitySettings.passwordExpiration}
                onChange={handleSecuritySettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sessionTimeout">Thời gian timeout (phút)</label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={settings.securitySettings.sessionTimeout}
                onChange={handleSecuritySettingsChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ipWhitelist">IP Whitelist (ngăn cách bằng dấu phẩy)</label>
              <input
                type="text"
                id="ipWhitelist"
                name="ipWhitelist"
                value={settings.securitySettings.ipWhitelist}
                onChange={handleSecuritySettingsChange}
                placeholder="Ví dụ: 192.168.1.1, 10.0.0.1"
              />
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn-save">Lưu cài đặt</button>
          <button type="button" className="btn-cancel">Hủy</button>
        </div>
      </form>
    </div>
  );
};

export default Settings;