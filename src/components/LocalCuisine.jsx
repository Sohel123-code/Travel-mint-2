import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, IndianRupee, Leaf, Drumstick } from 'lucide-react';
import './LocalCuisine.css';

// Image maps per state
const rajasthanImages = {
  "Dal Baati Churma": "/assets/cusines/Dal Baati Churma.jpg",
  "Laal Maas": "/assets/cusines/Laal Maas.webp",
  "Gatte Ki Sabzi": "/assets/cusines/Gatte Ki Sabzi.webp",
  "Ker Sangri": "/assets/cusines/Ker Sangri.jpg",
  "Pyaaz Kachori": "/assets/cusines/Pyaaz Kachori.jpg",
  "Mawa Kachori": "/assets/cusines/Mawa Kachori.webp",
  "Bajra Roti": "/assets/cusines/Bajra Roti.png",
  "Mohan Maas": "/assets/cusines/Mohan Maas.jpg",
  "Rajasthani Kadhi": "/assets/cusines/Rajasthani Kadhi.webp",
  "Mirchi Bada": "/assets/cusines/Mirchi Bada.jpeg",
  "Rabri": "/assets/cusines/Rabri.jpg",
  "Ghewar": "/assets/cusines/Ghewar.jpeg",
  "Malpua": "/assets/cusines/Malpua.jpg",
  "Moong Dal Halwa": "/assets/cusines/Moong Dal Halwa.webp",
  "Churma Ladoo": "/assets/cusines/Churma Ladoo.jpg",
  "Kachra Mirchi Curry": "/assets/cusines/Kachra Mirchi Curry.jpg",
  "Sev Tamatar Sabzi": "/assets/cusines/Sev Tamatar Sabzi.jpeg",
  "Bikaneri Bhujia": "/assets/cusines/Bikaneri Bhujia.webp",
  "Rajasthani Thali": "/assets/cusines/Rajasthani Thali.jpeg",
  "Papad Ki Sabzi": "/assets/cusines/Papad Ki Sabzi.webp",
};

const himachalImages = {
  "Dham": "/assets/cusines/Dham.webp",
  "Chha Gosht": "/assets/cusines/Chha Gosht.webp",
  "Siddu": "/assets/cusines/Siddu.jpg",
  "Madra": "/assets/cusines/Madra.avif",
  "Tudkiya Bhath": "/assets/cusines/Tudkiya Bhath.webp",
  "Babru": "/assets/cusines/Babru.jpg",
  "Bhey": "/assets/cusines/Bhey.webp",
  "Aktori": "/assets/cusines/Aktori.jpg",
  "Mittha": "/assets/cusines/Mittha.cms",
  "Sepu Vadi": "/assets/cusines/Sepu Vadi.jpeg",
  "Chana Madra": "/assets/cusines/Chana Madra.jpeg",
  "Kullu Trout": "/assets/cusines/Kullu Trout.png",
  "Patande": "/assets/cusines/Patande.avif",
  "Thukpa": "/assets/cusines/Thukpa.jpg",
  "Momos": "/assets/cusines/Momos.jpeg",
  "Chana Bhatura": "/assets/cusines/Chana Bhatura.jpeg",
  "Bhaturu": "/assets/cusines/Bhaturu.jpeg",
  "Tibetan Bread": "/assets/cusines/Tibetan Bread.jpeg",
  "Chicken Anardana": "/assets/cusines/Chicken Anardana.jpeg",
  "Kangri Dham": "/assets/cusines/Kangri Dham,Kangra.jpeg",
};

const stateImageMaps = {
  rajasthan: rajasthanImages,
  himachal: himachalImages,
};

const stateSubtitles = {
  rajasthan: 'Savor the authentic flavors of Rajasthan',
  himachal: 'Taste the mountain delicacies of Himachal Pradesh',
  uttarakhand: 'Explore the wholesome cuisine of Uttarakhand',
};

const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/\r$/, ''));
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {});
  });
};

const LocalCuisine = ({ stateId }) => {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const imageMap = stateImageMaps[stateId] || rajasthanImages;
  const subtitle = stateSubtitles[stateId] || 'Explore authentic local cuisine';

  useEffect(() => {
    const fetchData = async () => {
      try {
        let csvPath = '/data/rajasthan_cuisine.csv';
        if (stateId === 'himachal') csvPath = '/data/himachal_cusine.csv';
        else if (stateId === 'uttarakhand') csvPath = '/data/uttarakand_cusine.csv';

        const res = await fetch(csvPath);
        const text = await res.text();
        const parsed = parseCSV(text);
        setCuisines(parsed);
      } catch (e) {
        console.error('CSV fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stateId]);

  const filtered = filter === 'All'
    ? cuisines
    : cuisines.filter(c => {
        const t = c['Food Type'];
        if (filter === 'Non-Veg') return t === 'Non-Veg' || t === 'Veg/Non-Veg';
        return t === filter;
      });

  if (loading) {
    return (
      <div className="cuisine-loading">
        <div className="cuisine-spinner" />
        <p>Loading delicious dishes...</p>
      </div>
    );
  }

  return (
    <div className="local-cuisine">
      <div className="cuisine-header">
        <h2 className="cuisine-title">Local Cuisine</h2>
        <p className="cuisine-subtitle">{subtitle}</p>
        <div className="cuisine-filters">
          {['All', 'Veg', 'Non-Veg'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'Veg' && <Leaf size={14} />}
              {f === 'Non-Veg' && <Drumstick size={14} />}
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="cuisine-grid">
        {filtered.map((item, idx) => {
          const imgSrc = imageMap[item.Cuisine] || null;
          const isVeg = item['Food Type'] === 'Veg';
          return (
            <motion.div
              key={idx}
              className="cuisine-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="cuisine-img-wrap">
                {imgSrc ? (
                  <img src={imgSrc} alt={item.Cuisine} className="cuisine-img" loading="lazy" />
                ) : (
                  <div className="cuisine-img-placeholder">🍽️</div>
                )}
                <span className={`food-type-badge ${isVeg ? 'veg' : 'non-veg'}`}>
                  {isVeg ? <Leaf size={11} /> : <Drumstick size={11} />}
                  {item['Food Type']}
                </span>
              </div>

              <div className="cuisine-card-body">
                <h3 className="cuisine-name">{item.Cuisine}</h3>

                <div className="cuisine-meta">
                  <span className="meta-item">
                    <MapPin size={13} />
                    {item.City}
                  </span>
                  <span className="meta-item cost">
                    <IndianRupee size={13} />
                    {item['Estimated Cost (INR)']}
                  </span>
                </div>

                <p className="cuisine-place">
                  📍 {item['Famous Place/Area']}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LocalCuisine;
