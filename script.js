class ContactsApp {
  constructor() {
    this.contacts = [];
    this.editingId = null;
    this.highlightedId = null;
    this.init();
  }

  init() {
    this.loadFromStorage();

    document.getElementById('submitBtn').addEventListener('click', () => this.handleSubmit());
    document.getElementById('cancelBtn').addEventListener('click', () => this.cancelEdit());
    document.getElementById('search').addEventListener('input', () => this.render());

    this.render();
  }

  loadFromStorage() {
    const saved = localStorage.getItem('contacts');
    if (saved) {
      this.contacts = JSON.parse(saved);
    }
  }

  saveToStorage() {
    localStorage.setItem('contacts', JSON.stringify(this.contacts));
  }

  handleSubmit() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    nameInput.classList.remove('error');
    emailInput.classList.remove('error');

    if (!name || !email) {
      if (!name) nameInput.classList.add('error');
      if (!email) emailInput.classList.add('error');
      return;
    }

    const contact = {
      id: this.editingId || Date.now(),
      name,
      email
    };

    if (this.editingId) {
      this.updateContact(contact);
    } else {
      this.addContact(contact);
    }

    this.resetForm();
    this.render();
  }

  addContact(contact) {
    this.contacts.push(contact);
    this.saveToStorage();
  }

  updateContact(updated) {
    const index = this.contacts.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      this.contacts[index] = updated;
      this.saveToStorage();

      this.highlightedId = updated.id;
      this.render();

      // Remove highlight after 2 seconds
      setTimeout(() => {
        this.highlightedId = null;
        this.render();
      }, 2000);
    }
  }

  deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.contacts = this.contacts.filter(c => c.id !== id);
      this.saveToStorage();
      this.render();
    }
  }

  editContact(id) {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      this.editingId = id;
      document.getElementById('name').value = contact.name;
      document.getElementById('email').value = contact.email;
      document.getElementById('submitBtn').textContent = 'Update';
      document.getElementById('submitBtn').className = 'btn-update';
      document.getElementById('cancelBtn').style.display = 'inline-block';
      document.getElementById('name').focus();
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
    this.render();
  }

  resetForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('submitBtn').textContent = 'Add Contact';
    document.getElementById('submitBtn').className = 'btn-add';
    document.getElementById('cancelBtn').style.display = 'none';
  }

  render() {
    const grid = document.getElementById('contactsGrid');
    const searchTerm = document.getElementById('search').value.toLowerCase();

    const filtered = this.contacts.filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="text-align: center;">No contacts found. Try adding one!</p>`;
      return;
    }

    grid.innerHTML = filtered.map(c => `
      <div class='card ${this.highlightedId === c.id ? 'highlight' : ''}'>
        <strong>Name: ${c.name}</strong>
        <strong>Email: ${c.email}</strong>
        <div class="card-actions">
          <button class="btn-edit" onclick="app.editContact(${c.id})">Edit</button>
          <button class="btn-delete" onclick="app.deleteContact(${c.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }
}

const app = new ContactsApp();
window.app = app;
