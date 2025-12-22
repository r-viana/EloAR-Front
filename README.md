# EloAR Frontend - Sistema de Enturmação Inteligente

Interface web React + TypeScript + Vite para o Sistema de Enturmação Inteligente.

## 🚀 Tecnologias

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router v6
- Zustand (gerenciamento de estado)
- TanStack Query (React Query)
- Axios
- @dnd-kit (drag-and-drop)
- React Hot Toast
- Recharts

## 📁 Estrutura do Projeto

```
EloAR-Front/
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizáveis
│   │   └── layout/          # Componentes de layout
│   ├── pages/               # Páginas da aplicação
│   ├── services/            # Serviços de API
│   ├── hooks/               # Custom hooks
│   ├── store/               # Zustand store
│   ├── types/               # Tipos TypeScript
│   ├── utils/               # Funções utilitárias
│   ├── styles/              # Estilos globais
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Ponto de entrada
├── public/                  # Arquivos estáticos
└── index.html
```

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`.

### Preview do Build

```bash
npm run preview
```

## 🎨 Estilização

O projeto usa **TailwindCSS** para estilização. Classes utilitárias estão disponíveis:

### Classes Customizadas

```tsx
// Botões
<button className="btn-primary">Primário</button>
<button className="btn-secondary">Secundário</button>
<button className="btn-danger">Perigo</button>

// Card
<div className="card">Conteúdo</div>

// Input
<input className="input" />

// Label
<label className="label">Nome</label>
```

### Paleta de Cores

- **Primary**: Azul (tons de 50 a 950)
- **Secondary**: Roxo (tons de 50 a 950)
- **Success**: Verde (tons de 50 a 950)
- **Warning**: Amarelo (tons de 50 a 950)
- **Danger**: Vermelho (tons de 50 a 950)

## 🗂️ Gerenciamento de Estado

O projeto usa **Zustand** para gerenciamento de estado global:

```tsx
import { useAppStore } from '@/store';

function Component() {
  const { activeSchoolYear, setActiveSchoolYear } = useAppStore();

  return (
    // ...
  );
}
```

### Estado Disponível

- `sidebarOpen`: Controla a sidebar
- `activeSchoolYear`: Ano letivo ativo
- `activeGradeLevel`: Série ativa
- `weights`: Configuração de pesos do AG

## 🌐 Chamadas de API

Use a instância configurada do Axios:

```tsx
import api from '@/services/api';

// GET
const response = await api.get('/students');

// POST
const response = await api.post('/students', data);

// PUT
const response = await api.put('/students/1', data);

// DELETE
const response = await api.delete('/students/1');
```

### React Query

Para queries com cache:

```tsx
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students');
      return response.data;
    },
  });
}
```

## 🎯 Rotas Disponíveis

- `/` - Redireciona para `/dashboard`
- `/dashboard` - Dashboard principal
- `*` - Página 404

### Rotas Futuras (comentadas no código)

- `/import` - Importação de dados
- `/students` - Gerenciamento de alunos
- `/preferences` - Gerenciamento de preferências
- `/constraints` - Gerenciamento de restrições
- `/configuration` - Configuração de pesos
- `/optimization` - Controle de otimização
- `/distribution/:id` - Quadro de distribuição
- `/reports` - Relatórios

## 🧩 Aliases de Path

Aliases configurados no `vite.config.ts` e `tsconfig.json`:

```tsx
import Component from '@/components/Component';
import { useHook } from '@hooks/useHook';
import api from '@services/api';
import { useAppStore } from '@store';
import { Type } from '@types/types';
import { util } from '@utils/util';
```

## 🎨 Formatação e Linting

```bash
# Lint
npm run lint

# Lint e corrigir
npm run lint:fix

# Format com Prettier
npm run format

# Type check
npm run type-check
```

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm test
```

## 📦 Build Otimizado

O Vite está configurado para:
- Code splitting automático
- Chunks separados por vendor:
  - `react-vendor`: React, React DOM, React Router
  - `state-vendor`: Zustand, React Query
  - `dnd-vendor`: @dnd-kit
  - `utils-vendor`: Axios, Papaparse, xlsx
- Source maps em produção
- Assets otimizados

## 🌟 Features Principais

### Fase 1 (Atual) ✅
- ✅ Configuração do projeto
- ✅ Dashboard com health check dos serviços
- ✅ Roteamento básico
- ✅ Estado global com Zustand
- ✅ Integração com backend via Axios
- ✅ Estilização com TailwindCSS

### Próximas Fases
- [ ] Fase 2: Páginas de importação de dados
- [ ] Fase 3: Gerenciamento de preferências e restrições
- [ ] Fase 4: Painel de configuração de pesos
- [ ] Fase 5: Integração com algoritmo genético
- [ ] Fase 7: Interface drag-and-drop de distribuição
- [ ] Fase 8: Geração de relatórios

## 🚨 Troubleshooting

### Porta 5173 em uso

```bash
# Matar processo na porta 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Ou use outra porta
npm run dev -- --port 3001
```

### Erro de conexão com API

Verifique se:
1. O backend está rodando em `http://localhost:3000`
2. O arquivo `.env` está configurado corretamente
3. O CORS está configurado no backend

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Commit: `git commit -m 'Adiciona minha feature'`
3. Push: `git push origin feature/minha-feature`
4. Abra um Pull Request

## 📄 Licença

MIT
