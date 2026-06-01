const API = 'http://localhost:3000/api';

window.onload = () => {
  loadAnalytics();
  loadAllDonations();
};

// Load Campaign Analytics
async function loadAnalytics() {
  try {
    const res = await fetch(`${API}/admin/analytics`);
    const data = await res.json();
    const tbody = document.getElementById('analyticsTable');

    tbody.innerHTML = data.data.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>₹${Number(c.goal_amount).toLocaleString()}</td>
        <td>₹${Number(c.total_raised).toLocaleString()}</td>
        <td>${c.donation_count}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${Math.min(c.progress_percent,100)}%"></div>
          </div>
          ${c.progress_percent}%
        </td>
        <td>
          <span class="badge ${c.is_active ? 'active' : 'closed'}">
            ${c.is_active ? '✅ Active' : '🔒 Closed'}
          </span>
        </td>
        <td>
          ${c.is_active ? `
  <button class="btn btn-primary" 
    style="width:auto;background:#e74c3c;padding:6px 14px"
    onclick="closeCampaign('${c.name}')">
    🔒 Close
  </button>` : `
  <button class="btn btn-primary" 
    style="width:auto;background:#2ecc71;padding:6px 14px"
    onclick="reopenCampaign('${c.name}')">
    ✅ Reopen
  </button>`}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('analyticsTable').innerHTML = 
      '<tr><td colspan="7">Failed to load</td></tr>';
  }
}

// Load All Donations
async function loadAllDonations() {
  try {
    const res = await fetch(`${API}/admin/donations`);
    const data = await res.json();
    const tbody = document.getElementById('allDonationsTable');

    if (data.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No donations yet</td></tr>';
      return;
    }

    tbody.innerHTML = data.data.map(d => `
      <tr>
        <td>${d.donor_name}</td>
        <td>${d.email}</td>
        <td>₹${Number(d.amount).toLocaleString()}</td>
        <td>${d.campaign_name}</td>
        <td>${new Date(d.created_at).toLocaleString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('allDonationsTable').innerHTML = 
      '<tr><td colspan="5">Failed to load</td></tr>';
  }
}

// Close Campaign
async function closeCampaign(name) {
  // Get campaign id from analytics
  const res = await fetch(`${API}/campaigns`);
  const data = await res.json();
  const campaign = data.data.find(c => c.name === name);

  if (!confirm(`Are you sure you want to close "${name}"?`)) return;

  try {
    const r = await fetch(`${API}/admin/campaigns/${campaign.id}/close`, {
      method: 'PATCH'
    });
    const result = await r.json();
    if (result.success) {
      alert('Campaign closed successfully!');
      loadAnalytics();
    }
  } catch (err) {
    alert('Failed to close campaign');
  }
}

// Reopen Campaign
async function reopenCampaign(name) {
  const res = await fetch(`${API}/campaigns`);
  const data = await res.json();
  const campaign = data.data.find(c => c.name === name);

  if (!confirm(`Are you sure you want to reopen "${name}"?`)) return;

  try {
    const r = await fetch(`${API}/admin/campaigns/${campaign.id}/reopen`, {
      method: 'PATCH'
    });
    const result = await r.json();
    if (result.success) {
      alert('Campaign reopened successfully!');
      loadAnalytics();
    }
  } catch (err) {
    alert('Failed to reopen campaign');
  }
}

// Download CSV
function downloadCSV() {
  fetch(`${API}/admin/donations`)
    .then(r => r.json())
    .then(data => {
      const rows = [
        ['Donor Name', 'Email', 'Amount', 'Campaign', 'Date'],
        ...data.data.map(d => [
          d.donor_name,
          d.email,
          d.amount,
          d.campaign_name,
          new Date(d.created_at).toLocaleString()
        ])
      ];

      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'donations.csv';
      a.click();
    });
}