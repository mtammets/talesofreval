import React from 'react'
import ButtonPrimary from '../components/style-components/ButtonPrimary'
import ButtonSecondary from '../components/style-components/ButtonSecondary'
import TripAdvisorButton from '../components/style-components/TripAdvisorButton'
import SocialButton from '../components/style-components/SocialButton'

function StyleGuide() {
  return (
    <div className="container" style={{paddingTop: "15%"}}>
        <h1>Style Guide</h1>

        <section className="section padding-50-top padding-50-bottom">
            <h2>Colors</h2>
            <div style={{backgroundColor: 'var(--red)'}}>Red</div>
            <div style={{backgroundColor: 'var(--salmon)'}}>Salmon</div>
            <div style={{backgroundColor: 'var(--salmon-light)'}}>Salmon Light</div>
            <div style={{backgroundColor: 'var(--blue)'}}>Blue</div>
            <div style={{backgroundColor: 'var(--dark-blue)'}}>Dark Blue</div>
            <div style={{backgroundColor: 'var(--darker-cream)'}}>Darker Cream</div>
            <div style={{backgroundColor: 'var(--cream)'}}>Cream</div>
            <div style={{backgroundColor: 'var(--darker-sage)'}}>Darker Sage</div>
            <div style={{backgroundColor: 'var(--sage)'}}>Sage</div>
            <div style={{backgroundColor: 'var(--darker-turquoise)'}}>Darker Turquoise</div>
            <div style={{backgroundColor: 'var(--turquoise)'}}>Turquoise</div>
            <div style={{backgroundColor: 'var(--gray)'}}>Gray</div>
            <div style={{backgroundColor: 'var(--purple)'}}>Purple</div>
            <div style={{backgroundColor: 'var(--error-light)'}}>Error Light</div>
            <div style={{backgroundColor: 'var(--error)'}}>Error</div>
            <div style={{backgroundColor: 'var(--success-white)'}}>Success White</div>
            <div style={{backgroundColor: 'var(--green)'}}>Green</div>
            <div style={{backgroundColor: 'var(--darker-green)'}}>Darker Green</div>
        </section>

        <section className="section padding-50-top padding-50-bottom">
          <ButtonPrimary text="Read more" icon="ArrowRightUp"/>
          <div className="padding-10-top"></div>
          <ButtonSecondary text="Cancel" />
          <div className="padding-10-top"></div>
          <SocialButton icon = "Facebook" text="Facebook" />
          <div className="padding-10-top"></div>
          <SocialButton icon = "Instagram" text="Instagram" />
          <div className="padding-10-top"></div>
          <SocialButton icon = "AirBnB" text="AirBnB" />
          <div className="padding-10-top"></div>
          <SocialButton icon = "TripAdvisor" text="TripAdvisor" />
          <div className="padding-10-top"></div>
          <TripAdvisorButton text="TripAdvisor Button" />
        </section>

      <section className="section padding-50-top padding-50-bottom">
        <h2>Typography</h2>
        <h1>H1 Heading</h1>
        <h2>H2 Heading</h2>
        <h3 className="cardo">H3 Cardo Heading</h3>
        <h3 className="inter">H3 Inter Heading</h3>
        <h4 className="inter">H4 Inter Heading</h4>
        <h5 className="inter">H5 Inter Heading</h5>
        <p className="s">Small paragraph</p>
        <p className="r">Regular paragraph</p>
        <p className="l">Large paragraph</p>
        <p className="xl">Extra Large paragraph</p>
        <p className="xl bold">Extra Large Bold paragraph</p>
      </section>

    </div>
  )
}

export default StyleGuide