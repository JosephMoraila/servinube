import './About.css'
import UASLOGO from '/images/logo_uas.png'
import FICLOGO from '/images/LogoFIC.png'

const About = () => {
  return (
    <div className='AboutDiv'>
      <h1>Acerca de</h1>
      <p>Esto es un proyecto de escuela de la Facultad de Informática de la Universidad Autónoma de Sinaloa de un equipo de un grupo de estudiantes de cuarto año.</p>
      <br />
      <p>Si nos apoyanos te lo agradeceríamos muchísimo.</p>
      <br />
      <div className='LogosAbout'>
        <img src={UASLOGO} alt="Logo UAS" />
        <img src={FICLOGO} alt="Facultad Informatica" />
      </div>
    </div>
  );
};

export default About;
