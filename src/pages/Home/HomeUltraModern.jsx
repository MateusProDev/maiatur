import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BannerCarousel from '../../components/BannerCarousel/BannerCarousel';
import BlogPreview from '../../components/BlogPreview/BlogPreview';
import PacotesCarousel from '../../components/PacotesCarousel/PacotesCarousel';
import GoogleReviews from '../../components/GoogleReviews/GoogleReviews';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import TransferBeberibe from '../../components/TransferBeberibe/TransferBeberibe';
import HomeFAQSection from '../../components/HomeFAQSection/HomeFAQSection';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { seoData } from '../../utils/seoData';
import {
  FiMapPin,
  FiStar,
  FiArrowRight,
  FiAward,
  FiSun,
  FiHeart,
  FiCamera,
  FiShield,
  FiSmile,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiCheckCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
/*
 * HomeUltraModern.css e ServicesMissingImages.css são importados no
 * src/index.js, para entrarem no bundle de ENTRADA. Mantê-los aqui os
 * colocaria num chunk lazy, injetado no <head> só depois que o JS do
 * componente executasse — e o HTML pré-renderizado apareceria sem estilo
 * nesse intervalo.
 */

import { autoOptimize, generateCloudinarySrcset } from '../../utils/cloudinaryOptimizer';