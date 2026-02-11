import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Skills.css';

const Skills = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const skills = {
    frontend: [
      { name: 'React', icon: '⚛️', level: 5, color: '#61DAFB' },
      { name: 'TypeScript', icon: '📘', level: 5, color: '#3178C6' },
      { name: 'JavaScript', icon: '💛', level: 5, color: '#F7DF1E' },
      { name: 'HTML/CSS', icon: '🎨', level: 5, color: '#E34F26' },
      { name: 'Next.js', icon: '▲', level: 4, color: '#ffffff' },
    ],
    backend: [
      { name: 'Node.js', icon: '🟢', level: 4, color: '#339933' },
      { name: 'Express', icon: '🚂', level: 4, color: '#ffffff' },
      { name: 'PostgreSQL', icon: '🐘', level: 4, color: '#336791' },
      { name: 'MongoDB', icon: '🍃', level: 3, color: '#47A248' },
      { name: 'NestJS', icon: '🦅', level: 3, color: '#E0234E' },
    ],
    tools: [
      { name: 'Git', icon: '📦', level: 5, color: '#F05032' },
      { name: 'Docker', icon: '🐳', level: 4, color: '#2496ED' },
      { name: 'AWS', icon: '☁️', level: 3, color: '#FF9900' },
      { name: 'Google Cloud', icon: '☁️', level: 3, color: '#4285F4' },
      { name: 'Figma', icon: '🎨', level: 4, color: '#F24E1E' },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const renderDots = (level: number, color: string) => {
    return (
      <div className="skill-level-dots">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`dot ${i < level ? 'active' : ''}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: i * 0.1 }}
            style={i < level ? { backgroundColor: color, boxShadow: `0 0 5px ${color}` } : {}}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="skills" className="skills">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <div className="section-header">
            <motion.div variants={itemVariants} className="section-title">
              <h2><span className="index">02.</span>{t('skills.title')}</h2>
            </motion.div>
            <motion.p variants={itemVariants} className="section-subtitle">
              {t('skills.subtitle')}
            </motion.p>
          </div>

          <div className="skills-grid">
            <motion.div variants={itemVariants} className="skill-category">
              <div className="category-header">
                <h3>{t('skills.frontend')}</h3>
                <span className="category-icon">⚡</span>
              </div>
              <div className="skill-list">
                {skills.frontend.map((skill) => (
                  <div 
                    key={skill.name} 
                    className="skill-item"
                    style={{ '--skill-color': skill.color } as React.CSSProperties}
                  >
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                    {renderDots(skill.level, skill.color)}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="skill-category">
              <div className="category-header">
                <h3>{t('skills.backend')}</h3>
                <span className="category-icon">🔗</span>
              </div>
              <div className="skill-list">
                {skills.backend.map((skill) => (
                  <div 
                    key={skill.name} 
                    className="skill-item"
                    style={{ '--skill-color': skill.color } as React.CSSProperties}
                  >
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                    {renderDots(skill.level, skill.color)}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="skill-category">
              <div className="category-header">
                <h3>{t('skills.tools')}</h3>
                <span className="category-icon">🛠️</span>
              </div>
              <div className="skill-list">
                {skills.tools.map((skill) => (
                  <div 
                    key={skill.name} 
                    className="skill-item"
                    style={{ '--skill-color': skill.color } as React.CSSProperties}
                  >
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                    {renderDots(skill.level, skill.color)}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
