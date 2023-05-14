document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('save').addEventListener('click', function () {
      var email = document.getElementById('email').value;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'save', email: email });
      });
    });
  });
  

  async function displayStoredPasswords() {
    const storedPasswords = await getStoredPasswords();
  
    const passwordList = document.getElementById('password-list');
    passwordList.innerHTML = '';
  
    for (const passwordData of storedPasswords) {
      const listItem = document.createElement('li');
      listItem.textContent = `URL: ${passwordData.url}, Password: ${passwordData.password}`;
      passwordList.appendChild(listItem);
    }
  }
  
  document.getElementById('show-passwords').addEventListener('click', displayStoredPasswords);
  


// Afficher les mots de passe stockés lors de l'ouverture de l'interface utilisateur de l'extension
displayStoredPasswords();