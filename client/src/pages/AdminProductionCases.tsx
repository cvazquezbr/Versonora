import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/utils';
import { API_URL } from '../lib/api-config';
import { Loader2, Plus, Edit, Trash2, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';

interface ProductionCase {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  youtube_url: string;
  created_at: string;
}

const AdminProductionCases = () => {
  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  const [cases, setCases] = useState<ProductionCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCase, setEditingCase] = useState<Partial<ProductionCase> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { token } = useAuth();

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/production-cases`);
      setCases(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Falha ao carregar casos de produção'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOpenCreate = () => {
    setEditingCase({ name: '', description: '', youtube_url: '' });
    setFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (productionCase: ProductionCase) => {
    setEditingCase(productionCase);
    setFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este caso?')) {
      try {
        await axios.delete(`${API_URL}/api/production-cases/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Caso excluído com sucesso');
        fetchCases();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Falha ao excluir caso'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;

    const formData = new FormData();
    formData.append('name', editingCase.name || '');
    formData.append('description', editingCase.description || '');
    formData.append('youtube_url', editingCase.youtube_url || '');
    if (file) {
      formData.append('cover', file);
    } else if (editingCase.cover_url) {
      formData.append('cover_url', editingCase.cover_url);
    }

    try {
      if (editingCase.id) {
        await axios.put(`${API_URL}/api/production-cases/${editingCase.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Caso atualizado com sucesso');
      } else {
        await axios.post(`${API_URL}/api/production-cases`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Caso criado com sucesso');
      }
      setIsModalOpen(false);
      fetchCases();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Falha ao salvar caso'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header showNav={false} />
      <div className="container pt-24 pb-12 mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900">Casos de Produção</h2>
            <Link href="/admin">
              <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <Users size={16} />
                Usuários
              </button>
            </Link>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Novo Caso
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((pc) => (
              <div key={pc.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                {pc.cover_url && (
                  <img src={getImageUrl(pc.cover_url)} alt={pc.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pc.name}</h3>
                  <p className="text-slate-600 line-clamp-3 mb-4">{pc.description}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(pc)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(pc.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cases.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                Nenhum caso cadastrado.
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCase.id ? 'Editar Caso' : 'Novo Caso'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={editingCase.name}
                  onChange={(e) => setEditingCase({ ...editingCase, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={4}
                  value={editingCase.description}
                  onChange={(e) => setEditingCase({ ...editingCase, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capa (Imagem)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL do Vídeo (YouTube)</label>
                <input
                  type="url"
                  value={editingCase.youtube_url}
                  onChange={(e) => setEditingCase({ ...editingCase, youtube_url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductionCases;
