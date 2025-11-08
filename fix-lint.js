// Script para corrigir erros de lint automaticamente
const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/components/Admin/AdminHelp/AdminHelp.jsx',
    find: "import { FiHome, FiPackage, FiImage, FiBarChart2, FiFileText, FiInfo, FiHelpCircle, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';",
    replace: "import { FiHome, FiPackage, FiImage, FiBarChart2, FiFileText, FiHelpCircle, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';"
  },
  {
    file: 'src/components/Admin/AdminReservas/AdminReservas.jsx',
    find: "import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';",
    replace: "import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';"
  },
  {
    file: 'src/components/Admin/AdminReservas/AdminReservas.jsx',
    find: "import { Card, CardContent, CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip } from '@mui/material';",
    replace: "import { Card, CardContent, CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';"
  },
  {
    file: 'src/components/AdminPacotes/AdminPacotes.jsx',
    find: "import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress, Divider } from '@mui/material';",
    replace: "import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress } from '@mui/material';"
  },
  {
    file: 'src/pages/CategoriaPage/CategoriaPage.jsx',
    find: "import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';",
    replace: "import { collection, getDocs, query, orderBy } from 'firebase/firestore';"
  },
  {
    file: 'src/pages/CategoriaPage/CategoriaPage.jsx',
    find: "import { FiMapPin, FiClock, FiUsers, FiStar, FiCalendar, FiArrowRight } from 'react-icons/fi';",
    replace: "import { FiMapPin, FiClock, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';"
  },
  {
    file: 'src/pages/PacotesListPage/PacotesListPage.jsx',
    find: "import { FiMapPin, FiClock, FiUsers, FiStar, FiCalendar, FiTrendingUp, FiArrowRight } from 'react-icons/fi';",
    replace: "import { FiMapPin, FiClock, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';"
  },
  {
    file: 'src/services/reservasService.js',
    find: "import { TipoReserva } from '../models/reserva.model';",
    replace: "// import { TipoReserva } from '../models/reserva.model';"
  }
];

console.log('Aplicando correções de lint...\n');

fixes.forEach(({ file, find, replace }) => {
  try {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(find)) {
        content = content.replace(find, replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file}`);
      } else {
        console.log(`⚠️  ${file} - Texto não encontrado`);
      }
    } else {
      console.log(`❌ ${file} - Arquivo não existe`);
    }
  } catch (error) {
    console.log(`❌ ${file} - Erro: ${error.message}`);
  }
});

console.log('\nCorreções concluídas!');
