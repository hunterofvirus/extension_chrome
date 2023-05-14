chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'save') {
    var passwords = document.querySelectorAll('input[type="password"]');
    var savedPasswords = [];

    for (var i = 0; i < passwords.length; i++) {
      var password = passwords[i].value;
      if (password) {
        savedPasswords.push(password);
      }
    }

    if (savedPasswords.length > 0) {
      var data = {
        url: window.location.href,
        passwords: savedPasswords,
      };

      // Stocker localement
      chrome.storage.local.set({ [data.url]: data.passwords });

      // Envoyer par email (si spécifié)
      if (request.email) {
        var body = `URL: ${data.url}\n\nMots de passe:\n${savedPasswords.join('\n')}`;
        window.open(`mailto:${request.email}?subject=Mots de passe sauvegardés&body=${encodeURIComponent(body)}`);
      }
    } else {
      alert('Aucun mot de passe trouvé sur cette page.');
    }
  }
});


async function encryptData(data, key) {
    const encodedData = new TextEncoder().encode(data);
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      key,
      encodedData
    );
    return new Uint8Array(encryptedData);
  }

  
  async function deriveKey(password, salt, iterations) {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const derivedKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    return derivedKey;
  }
  

  async function decryptData(encryptedData, key) {
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      key,
      encryptedData
    );
    return new TextDecoder().decode(decryptedData);
  }

  async function getStoredPasswords() {
    const storedPasswords = await getPasswordsFromStorage();
    const decryptedPasswords = [];
  
    for (const passwordData of storedPasswords) {
      const decryptedPassword = await decryptData(passwordData.encryptedPassword, derivedKey);
      decryptedPasswords.push({
        url: passwordData.url,
        password: decryptedPassword,
      });
    }
  
    return decryptedPasswords;
  }
  