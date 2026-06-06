import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

export default function Admin() {
  const [loadingId, setLoadingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.users;
    },
  });

  const handleToggleUnlimited = async (userId) => {
    setLoadingId(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-unlimited`);
      toast.success(data.message || 'Updated successfully ✓');
      
      // Update local query cache
      queryClient.setQueryData(['admin-users'], (oldUsers = []) => {
        return oldUsers.map(u => u._id === userId ? { ...u, unlimitedAI: data.user.unlimitedAI } : u);
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update privileges');
    }
    setLoadingId(null);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Admin Panel</h1>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>
          Manage user AI advisor permissions and check usage
        </p>
      </div>

      <div className="card" style={{ padding: 20 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span className="spinner" style={{ width: 32, height: 32 }} />
            <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 12 }}>Loading users...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--red)' }}>
            <p style={{ fontSize: 14, fontFamily: 'var(--font-mono)' }}>Error loading users list. Access denied or backend error.</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>No registered users found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px 8px' }}>User Details</th>
                  <th style={{ padding: '12px 8px' }}>Joined Date</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>Prompts Used</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>Privileges</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #1E2A3A55', fontSize: 13 }}>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name} {u.isAdmin && <span style={{ fontSize: 10, background: 'var(--gold-dim)', color: 'var(--gold)', padding: '1px 5px', borderRadius: 4, marginLeft: 6 }}>Admin</span>}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '14px 8px', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'center', fontWeight: 600, fontFamily: 'var(--font-mono)', color: u.aiPromptCount >= 2 && !u.unlimitedAI ? 'var(--red)' : 'var(--text-muted)' }}>
                      {u.aiPromptCount}
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                      {u.unlimitedAI ? (
                        <span style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(16, 185, 129, 0.3)' }}>Unlimited</span>
                      ) : (
                        <span style={{ fontSize: 10, background: '#1E2A3A', color: 'var(--text-dim)', padding: '2px 8px', borderRadius: 10 }}>Free Limit (2)</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      {u.isAdmin ? (
                        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>N/A</span>
                      ) : (
                        <button
                          onClick={() => handleToggleUnlimited(u._id)}
                          disabled={loadingId === u._id}
                          className="ghost-btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: 11,
                            borderColor: u.unlimitedAI ? 'rgba(255, 107, 107, 0.3)' : '#C9A84C44',
                            color: u.unlimitedAI ? 'var(--red)' : 'var(--gold)',
                          }}
                        >
                          {loadingId === u._id ? (
                            <span className="spinner" style={{ width: 12, height: 12 }} />
                          ) : u.unlimitedAI ? (
                            'Revoke Unlimited'
                          ) : (
                            'Allow Unlimited'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
