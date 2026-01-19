import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile as UserProfileType } from '../types';
import { ArrowLeft, User, Target, Hash, Users, Save, Check } from 'lucide-react';

interface UserProfileProps {
  setViewState: (view: ViewState) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ setViewState }) => {
  const [formData, setFormData] = useState<UserProfileType>({
    handle: '',
    niche: '',
    followers: '',
    goal: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('arthur_user_profile');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (field: keyof UserProfileType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('arthur_user_profile', JSON.stringify(formData));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black animate-fade-in-up">
      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between">
         <button onClick={() => setViewState(ViewState.HOME)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
         </button>
         <h2 className="font-black text-sm uppercase tracking-widest">Perfil</h2>
         <div className="w-8"></div> {/* Spacer */}
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-12 flex flex-col">
          
          <div className="mb-12">
             <h1 className="text-4xl font-black mb-4 tracking-tighter">Quem é você no algoritmo?</h1>
             <p className="text-gray-500 font-medium leading-relaxed">
                Preencha seus dados para que a IA não precise perguntar a mesma coisa toda vez.
             </p>
          </div>

          <div className="space-y-8">
              
              {/* Handle */}
              <div className="group">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-black transition-colors">
                      <User className="w-4 h-4" /> Usuário (@)
                  </label>
                  <input 
                      value={formData.handle}
                      onChange={e => handleChange('handle', e.target.value)}
                      placeholder="@seu.nome"
                      className="w-full text-2xl font-bold border-b-2 border-gray-200 py-2 focus:border-black outline-none transition-colors bg-transparent placeholder-gray-200"
                  />
              </div>

              {/* Niche */}
              <div className="group">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-black transition-colors">
                      <Hash className="w-4 h-4" /> Nicho Principal
                  </label>
                  <input 
                      value={formData.niche}
                      onChange={e => handleChange('niche', e.target.value)}
                      placeholder="Ex: Culinária Saudável"
                      className="w-full text-2xl font-bold border-b-2 border-gray-200 py-2 focus:border-black outline-none transition-colors bg-transparent placeholder-gray-200"
                  />
              </div>

               {/* Followers */}
               <div className="group">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-black transition-colors">
                      <Users className="w-4 h-4" /> Seguidores Atuais
                  </label>
                  <input 
                      value={formData.followers}
                      onChange={e => handleChange('followers', e.target.value)}
                      placeholder="Ex: 5.000"
                      className="w-full text-2xl font-bold border-b-2 border-gray-200 py-2 focus:border-black outline-none transition-colors bg-transparent placeholder-gray-200"
                  />
              </div>

               {/* Goal */}
               <div className="group">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-black transition-colors">
                      <Target className="w-4 h-4" /> Objetivo Atual
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                      {['Crescimento Viral', 'Vendas/Leads', 'Monetização (RPM)', 'Autoridade'].map(goal => (
                          <button
                            key={goal}
                            onClick={() => handleChange('goal', goal)}
                            className={`p-4 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${
                                formData.goal === goal 
                                ? 'bg-black text-white border-black shadow-lg' 
                                : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
                            }`}
                          >
                              {goal}
                          </button>
                      ))}
                  </div>
              </div>

          </div>

          <div className="mt-12">
              <button 
                  onClick={handleSave}
                  className={`w-full py-5 rounded-none uppercase tracking-widest text-xs font-black transition-all duration-500 flex items-center justify-center gap-2 ${
                      saved ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-900'
                  }`}
              >
                  {saved ? (
                      <>
                        <Check className="w-4 h-4" /> Salvo com sucesso
                      </>
                  ) : (
                      <>
                        <Save className="w-4 h-4" /> Salvar Perfil
                      </>
                  )}
              </button>
          </div>

      </div>
    </div>
  );
};

export default UserProfile;