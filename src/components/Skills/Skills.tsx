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
      { name: 'React', icon: '⚛️', level: 100 },
      { name: 'TypeScript', icon: '📘', level: 100 },
      { name: 'JavaScript', icon: '💛', level: 100 },
      { name: 'HTML/CSS', icon: '🎨', level: 100 },
      { name: 'Next.js', icon: '▲', level: 100 },
    ],
    backend: [
      { name: 'Node.js', icon: '🟢', level: 100 },
      { name: 'Express', icon: '🚂', level: 100 },
      { name: 'PostgreSQL', icon: '🐘', level: 100 },
      { name: 'MongoDB', icon: '🍃', level: 100 },
      { name: 'NestJS', icon: '🦅', level: 100 },
    ],
    tools: [
      { name: 'Git', icon: '📦', level: 100 },
      { name: 'Docker', icon: '🐳', level: 100 },
      { name: 'AWS', icon: '☁️', level: 100 },
      { name: 'Google Cloud', icon: '☁️', level: 100 },
      { name: 'Redis', icon: '📦', level: 100 },
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="skills" className="skills section">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="section-title">
            <h2>{t('skills.title')}</h2>
            <p className="section-subtitle">{t('skills.subtitle')}</p>
          </motion.div>

          <div className="skills-grid">
            <motion.div variants={itemVariants} className="skill-category">
              <div className="category-header">
                <h3>{t('skills.frontend')}</h3>
                <span className="category-icon">🎨</span>
              </div>
              <div className="skill-list">
                {skills.frontend.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    className="skill-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="skill-info">
                      <span className="skill-icon">{skill.icon}</span>
                      <span className="skill-name">{skill.name}</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div
                        className="skill-progress"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="skill-category">
              <div className="category-header">
                <h3>{t('skills.backend')}</h3>
                <span className="category-icon">⚙️</span>
              </div>
              <div className="skill-list">
                {skills.backend.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    className="skill-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="skill-info">
                      <span className="skill-icon">{skill.icon}</span>
                      <span className="skill-name">{skill.name}</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div
                        className="skill-progress"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="skill-category">
              <div className="category-header">
                <h3>{t('skills.tools')}</h3>
                <span className="category-icon">🛠️</span>
              </div>
              <div className="skill-list">
                {skills.tools.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    className="skill-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="skill-info">
                      <span className="skill-icon">{skill.icon}</span>
                      <span className="skill-name">{skill.name}</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div
                        className="skill-progress"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
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
