const API = '/api';
let selectedCampaignId = null;

// Load everything on page load
window.onload = () => {
  loadCampaigns();
  loadDashboard();
};

// Load Campaigns
async function loadCampaigns() {
  try {
    const res = await fetch(`${API}/campaigns`);
    const data = await res.json();
    const grid = document.getElementById('campaignsGrid');
    grid.innerHTML = '';

    data.data.forEach(c => {
      const progress = Math.min((c.total_raised / c.goal_amount) * 100, 100).toFixed(1);
      const isActive = c.is_active === 1;

      grid.innerHTML += `
        <div class="campaign-card ${!isActive ? 'closed' : ''}" 
             onclick="${isActive ? `selectCampaign('${c.id}', '${c.name}')` : ''}">
          <h3>${c.name}</h3>
          <p>${c.description}</p>
          <span class="badge ${isActive ? 'active' : 'closed'}">
            ${isActive ? '✅ Active' : '🔒 Closed'}
          </span>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${progress}%"></div>
          </div>
          <small>₹${Number(c.total_raised).toLocaleString()} raised of ₹${Number(c.goal_amount).toLocaleString()}</small>
          <p><strong>${progress}% funded</strong></p>
        </div>
      `;
    });
  } catch (err) {
    document.getElementById('campaignsGrid').innerHTML = '<p>Failed to load campaigns</p>';
  }
}

// Load Dashboard Stats
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/donations/stats/dashboard`);
    const data = await res.json();
    const { overall, recent, topDonors } = data.data;

    document.getElementById('totalDonations').textContent = overall.total_donations || 0;
    document.getElementById('totalRaised').textContent = `₹${Number(overall.total_raised || 0).toLocaleString()}`;
    document.getElementById('avgDonation').textContent = `₹${Number(overall.avg_donation || 0).toFixed(0)}`;

    // Recent donations table
    const recentTbody = document.getElementById('recentDonationsTable');
    recentTbody.innerHTML = recent.length === 0 ? '<tr><td colspan="4">No donations yet</td></tr>' :
      recent.map(d => `
        <tr>
          <td>${d.donor_name}</td>
          <td>${d.email}</td>
          <td>₹${Number(d.amount).toLocaleString()}</td>
          <td>${new Date(d.created_at).toLocaleString()}</td>
        </tr>
      `).join('');

    // Top donors leaderboard
    const topTbody = document.getElementById('topDonorsTable');
    topTbody.innerHTML = topDonors.length === 0 ? '<tr><td colspan="4">No donors yet</td></tr>' :
      topDonors.map((d, i) => `
        <tr>
          <td>${['🥇','🥈','🥉'][i] || i+1}</td>
          <td>${d.donor_name}</td>
          <td>${d.email}</td>
          <td>₹${Number(d.total_donated).toLocaleString()}</td>
        </tr>
      `).join('');

  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// Select Campaign
function selectCampaign(id, name) {
  selectedCampaignId = id;
  document.getElementById('selectedCampaignName').textContent = name;
  document.getElementById('donationForm').style.display = 'block';
  document.getElementById('formError').textContent = '';
  document.getElementById('formSuccess').style.display = 'none';
  document.getElementById('donationForm').scrollIntoView({ behavior: 'smooth' });
}

// Submit Donation
async function submitDonation() {
  const donor_name = document.getElementById('donorName').value.trim();
  const email = document.getElementById('donorEmail').value.trim();
  const amount = document.getElementById('donorAmount').value;
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');
  const btn = document.getElementById('submitBtn');

  errorDiv.textContent = '';
  successDiv.style.display = 'none';

  // Frontend validation
  if (!donor_name) return errorDiv.textContent = 'Please enter your name';
  if (!email) return errorDiv.textContent = 'Please enter your email';
  if (!amount || amount <= 0) return errorDiv.textContent = 'Please enter a valid amount';

  // Loading state
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const res = await fetch(`${API}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: selectedCampaignId,
        donor_name, email,
        amount: parseFloat(amount)
      })
    });

    const data = await res.json();

    if (data.success) {
      successDiv.textContent = '🎉 Thank you for your donation!';
      successDiv.style.display = 'block';
      // Clear form
      document.getElementById('donorName').value = '';
      document.getElementById('donorEmail').value = '';
      document.getElementById('donorAmount').value = '';
      // Refresh data
      loadCampaigns();
      loadDashboard();
    } else {
      errorDiv.textContent = data.message || 'Donation failed. Please try again.';
    }
  } catch (err) {
    errorDiv.textContent = 'Server error. Please try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = '💝 Donate Now';
  }
}