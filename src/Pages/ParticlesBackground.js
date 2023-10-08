import React, { useState, useEffect } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import supabase from './Supabase';
import TrailToggleButton from './components/trailtoggleswitch';
import { Link, useNavigate } from 'react-router-dom';
import homeIcon from '../assets/background_component/home.png';
import './components/CSS/homebutton.css';

export default function ParticleBackground({
  authenticated,
  setAuthenticated,
}) {
  const navigate = useNavigate();
  const [isTrailEnabled, setIsTrailEnabled] = useState(false); // State to track if the trail is enabled or not

  useEffect(() => {
    // Check the initial state from local storage
    const savedState = localStorage.getItem('isTrailEnabled');
    if (savedState !== null) {
      setIsTrailEnabled(savedState === 'true');
    }
  }, []);

  const particlesInit = async (main) => {
    console.log(main);
    await loadFull(main);
  };
  const particlesLoaded = (container) => {
    console.log(container);
  };
  const toggleTrail = () => {
    setIsTrailEnabled(!isTrailEnabled);
  };

  const signOutButtonPress = async () => {
    const { error } = await supabase.auth.signOut();
    setAuthenticated(false);
    navigate('/login');
  };

  return (
    <div>
      {authenticated ? (
        <div>
          <button
            onClick={signOutButtonPress}
            className="global-signout-button"
          >
            Sign Out
          </button>
          <Link
            to="/"
            className="home-button"
          >
            <img
              src={homeIcon}
              alt="Home"
            />
          </Link>
        </div>
      ) : (
        <></>
      )}

      <TrailToggleButton
        isEnabled={isTrailEnabled}
        onToggle={toggleTrail}
      />

      <Particles
        options={{
          autoPlay: isTrailEnabled,
          background: {
            color: {
              value: '080016',
            },
            image: '',
            position: '',
            repeat: '',
            size: '',
            opacity: 1,
          },
          defaultThemes: {},
          delay: 0,
          fullScreen: {
            enable: true,
            zIndex: -1,
          },
          detectRetina: false,
          duration: 0,
          fpsLimit: 120,
          interactivity: {
            detectsOn: 'window',
            events: {
              onClick: {
                enable: false,
                mode: [],
              },
              onDiv: {
                selectors: [],
                enable: false,
                mode: [],
                type: 'circle',
              },
              onHover: {
                enable: isTrailEnabled,
                mode: 'trail',
                parallax: {
                  enable: false,
                  force: 2,
                  smooth: 10,
                },
              },
              resize: {
                delay: 0.5,
                enable: true,
              },
            },
            modes: {
              trail: {
                delay: 0.01,
                pauseOnStop: true,
                quantity: 5,
                particles: {
                  color: {
                    value: '#44004d',
                    animation: {
                      enable: false,
                      speed: 400,
                      sync: true,
                    },
                  },
                  collisions: {
                    enable: false,
                    mode: 'bounce',
                    overlap: {
                      enable: false,
                    },
                  },
                  links: {
                    enable: true,
                    triangles: {
                      enable: false,
                      color: {
                        value: '#000000',
                      },
                      frequency: 0,
                    },
                    shadow: {
                      enable: false,
                      blur: false,
                    },
                    blink: false,
                    consent: false,
                    warp: false,
                    distance: 125,
                    frequency: 1,
                    opacity: 0.54,
                  },
                  move: {
                    outModes: {
                      default: 'destroy',
                    },
                    speed: 2,
                  },
                  size: {
                    value: 3,
                    animation: {
                      enable: true,
                      speed: 5,
                      minimumValue: 1,
                      sync: true,
                      startValue: 'min',
                      destroy: 'max',
                    },
                    random: {
                      enable: false,
                      minimumValue: 2,
                    },
                  },
                  bounce: {
                    horizontal: {
                      random: {
                        enable: false,
                      },
                      value: 0,
                    },
                  },
                  life: {
                    delay: {
                      sync: false,
                      value: 0,
                    },
                    duration: {
                      value: 0,
                    },
                  },
                  twinkle: {
                    lines: {
                      enable: false,
                    },
                  },
                  shape: {
                    type: 'circle',
                  },
                },
              },
              attract: {
                distance: 200,
                duration: 0.4,
                easing: 'ease-out-quad',
                factor: 1,
                maxSpeed: 50,
                speed: 1,
              },
              bounce: {
                distance: 200,
              },
              bubble: {
                distance: 200,
                duration: 0.4,
                mix: false,
                divs: {
                  distance: 200,
                  duration: 0.4,
                  mix: false,
                  selectors: [],
                },
              },
              connect: {
                distance: 80,
                links: {
                  opacity: 0.5,
                },
                radius: 60,
              },
              grab: {
                distance: 100,
                links: {
                  blink: false,
                  consent: false,
                  opacity: 1,
                },
              },
              push: {
                default: false,
                groups: [],
                quantity: 4,
              },
              remove: {
                quantity: 2,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
                factor: 100,
                speed: 1,
                maxSpeed: 50,
                easing: 'ease-out-quad',
                divs: {
                  distance: 200,
                  duration: 0.4,
                  factor: 100,
                  speed: 1,
                  maxSpeed: 50,
                  easing: 'ease-out-quad',
                  selectors: [],
                },
              },
              slow: {
                factor: 3,
                radius: 200,
              },
              light: {
                area: {
                  gradient: {
                    start: {
                      value: '#ffffff',
                    },
                    stop: {
                      value: '#000000',
                    },
                  },
                  radius: 1000,
                },
                shadow: {
                  color: {
                    value: '#000000',
                  },
                  length: 2000,
                },
              },
            },
          },
          manualParticles: [],
          particles: {
            bounce: {
              horizontal: {
                random: {
                  enable: false,
                  minimumValue: 0.1,
                },
                value: 1,
              },
              vertical: {
                random: {
                  enable: false,
                  minimumValue: 0.1,
                },
                value: 1,
              },
            },
            collisions: {
              absorb: {
                speed: 2,
              },
              bounce: {
                horizontal: {
                  random: {
                    enable: false,
                    minimumValue: 0.1,
                  },
                  value: 1,
                },
                vertical: {
                  random: {
                    enable: false,
                    minimumValue: 0.1,
                  },
                  value: 1,
                },
              },
              enable: false,
              maxSpeed: 50,
              mode: 'bounce',
              overlap: {
                enable: true,
                retries: 0,
              },
            },
            color: {
              value: '#878787',
              animation: {
                h: {
                  count: 0,
                  enable: true,
                  offset: 0,
                  speed: 50,
                  delay: 0,
                  decay: 0,
                  sync: false,
                },
                s: {
                  count: 0,
                  enable: false,
                  offset: 0,
                  speed: 1,
                  delay: 0,
                  decay: 0,
                  sync: true,
                },
                l: {
                  count: 0,
                  enable: false,
                  offset: 0,
                  speed: 1,
                  delay: 0,
                  decay: 0,
                  sync: true,
                },
              },
            },
            groups: {},
            move: {
              angle: {
                offset: 0,
                value: 90,
              },
              attract: {
                distance: 200,
                enable: false,
                rotate: {
                  x: 3000,
                  y: 3000,
                },
              },
              center: {
                x: 50,
                y: 50,
                mode: 'percent',
                radius: 0,
              },
              decay: 0,
              distance: {},
              direction: 'none',
              drift: 0,
              enable: true,
              gravity: {
                acceleration: 9.81,
                enable: false,
                inverse: false,
                maxSpeed: 50,
              },
              path: {
                clamp: true,
                delay: {
                  random: {
                    enable: false,
                    minimumValue: 0,
                  },
                  value: 0,
                },
                enable: false,
                options: {},
              },
              outModes: {
                default: 'out',
                bottom: 'out',
                left: 'out',
                right: 'out',
                top: 'out',
              },
              random: false,
              size: false,
              speed: 2,
              spin: {
                acceleration: 0,
                enable: false,
              },
              straight: false,
              trail: {
                enable: false,
                length: 10,
                fill: {},
              },
              vibrate: false,
              warp: false,
            },
            number: {
              density: {
                enable: true,
                width: 1920,
                height: 1080,
              },
              limit: 0,
              value: 0,
            },
            opacity: {
              random: {
                enable: true,
                minimumValue: 0.3,
              },
              value: {
                min: 0.3,
                max: 0.8,
              },
              animation: {
                count: 0,
                enable: true,
                speed: 0.5,
                decay: 0,
                delay: 0,
                sync: false,
                mode: 'auto',
                startValue: 'random',
                destroy: 'none',
                minimumValue: 0.3,
              },
            },
            reduceDuplicates: false,
            shadow: {
              blur: 0,
              color: {
                value: '#000',
              },
              enable: false,
              offset: {
                x: 0,
                y: 0,
              },
            },
            shape: {
              close: true,
              fill: true,
              options: {},
              type: 'circle',
            },
            size: {
              random: {
                enable: true,
                minimumValue: 1,
              },
              value: {
                min: 1,
                max: 3,
              },
              animation: {
                count: 0,
                enable: true,
                speed: 3,
                decay: 0,
                delay: 0,
                sync: false,
                mode: 'auto',
                startValue: 'random',
                destroy: 'none',
                minimumValue: 1,
              },
            },
            stroke: {
              width: 0,
            },
            zIndex: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: 0,
              opacityRate: 1,
              sizeRate: 1,
              velocityRate: 1,
            },
            destroy: {
              bounds: {},
              mode: 'none',
              split: {
                count: 1,
                factor: {
                  random: {
                    enable: false,
                    minimumValue: 0,
                  },
                  value: 3,
                },
                rate: {
                  random: {
                    enable: false,
                    minimumValue: 0,
                  },
                  value: {
                    min: 4,
                    max: 9,
                  },
                },
                sizeOffset: true,
                particles: {},
              },
            },
            roll: {
              darken: {
                enable: false,
                value: 0,
              },
              enable: false,
              enlighten: {
                enable: false,
                value: 0,
              },
              mode: 'vertical',
              speed: 25,
            },
            tilt: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: 0,
              animation: {
                enable: false,
                speed: 0,
                decay: 0,
                sync: false,
              },
              direction: 'clockwise',
              enable: false,
            },
            twinkle: {
              lines: {
                enable: false,
                frequency: 0.05,
                opacity: 1,
              },
              particles: {
                enable: false,
                frequency: 0.05,
                opacity: 1,
              },
            },
            wobble: {
              distance: 5,
              enable: false,
              speed: {
                angle: 50,
                move: 10,
              },
            },
            life: {
              count: 0,
              delay: {
                random: {
                  enable: false,
                  minimumValue: 0,
                },
                value: 0,
                sync: false,
              },
              duration: {
                random: {
                  enable: false,
                  minimumValue: 0.0001,
                },
                value: 0,
                sync: false,
              },
            },
            rotate: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: 0,
              animation: {
                enable: false,
                speed: 0,
                decay: 0,
                sync: false,
              },
              direction: 'clockwise',
              path: false,
            },
            orbit: {
              animation: {
                count: 0,
                enable: false,
                speed: 1,
                decay: 0,
                delay: 0,
                sync: false,
              },
              enable: false,
              opacity: 1,
              rotation: {
                random: {
                  enable: false,
                  minimumValue: 0,
                },
                value: 45,
              },
              width: 1,
            },
            links: {
              blink: false,
              color: {
                value: 'random',
              },
              consent: false,
              distance: 100,
              enable: true,
              frequency: 1,
              opacity: 1,
              shadow: {
                blur: 5,
                color: {
                  value: '#000',
                },
                enable: false,
              },
              triangles: {
                enable: false,
                frequency: 1,
              },
              width: 1,
              warp: false,
            },
            repulse: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: 0,
              enabled: false,
              distance: 1,
              duration: 1,
              factor: 1,
              speed: 1,
            },
          },
          pauseOnBlur: true,
          pauseOnOutsideViewport: true,
          responsive: [],
          smooth: false,
          style: {},
          themes: [],
          zLayers: 100,
          emitters: [],
          motion: {
            disable: false,
            reduce: {
              factor: 4,
              value: true,
            },
          },
        }}
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
      />
    </div>
  );
}
