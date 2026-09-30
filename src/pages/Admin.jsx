import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import { PageHeader, Badge, EmptyState } from '../components/ui/index.jsx';

const FREE_LIMIT = 2;

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
      toast.success(data.message || 'Access updated');

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
    <div className="fade-in">
      <PageHeader
        title="Users & access"
        description="Review advisor usage and grant unlimited access"
        actions={!isLoading && !error && <span className="text-3 num" style={{ fontSize:13 }}>{users.length} users</span>}
      />

      <div className="card card-flush" style={{ overflow:'hidden' }}>
        {isLoading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:48 }}>
            <span className="spinner" style={{ width:22, height:22 }} />
          </div>
        ) : error ? (
          <EmptyState icon={AlertCircle} title="Couldn't load users" description="Access was denied or the server returned an error."/>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users yet"/>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  <th className="right">Questions used</th>
                  <th>Plan</th>
                  <th className="right"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span className="avatar" style={{ width:28, height:28, fontSize:12 }}>{u.name?.[0]?.toUpperCase()}</span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
                            {u.name}
                            {u.isAdmin && <Badge>Admin</Badge>}
                          </div>
                          <div className="text-3" style={{ fontSize:12.5 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-2 num" style={{ whiteSpace:'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('en', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td className="right num" style={{ color: u.aiPromptCount >= FREE_LIMIT && !u.unlimitedAI ? 'var(--negative)' : 'var(--text)' }}>
                      {u.aiPromptCount}{!u.unlimitedAI && <span className="text-3"> / {FREE_LIMIT}</span>}
                    </td>
                    <td>
                      {u.unlimitedAI ? <Badge tone="accent">Unlimited</Badge> : <Badge>Free</Badge>}
                    </td>
                    <td className="right">
                      {!u.isAdmin && (
                        <button
                          onClick={() => handleToggleUnlimited(u._id)}
                          disabled={loadingId === u._id}
                          className={`btn btn-sm ${u.unlimitedAI ? 'btn-ghost' : 'btn-secondary'}`}
                          style={{ minWidth:128 }}
                        >
                          {loadingId === u._id ? <span className="spinner" /> : u.unlimitedAI ? 'Revoke unlimited' : 'Grant unlimited'}
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
