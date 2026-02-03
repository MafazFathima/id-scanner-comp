import React from 'react';
import { Shield, Lock, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { useIsDesktop } from '../hooks/useMediaQuery';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <WelcomeScreenDesktop onGetStarted={onGetStarted} />;
  }

  return <WelcomeScreenMobile onGetStarted={onGetStarted} />;
}

function WelcomeScreenMobile({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div style={{
      // minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--spacing-lg)',
      // justifyContent: 'space-between',
      gap: 'var(--spacing-xl)',
    }}>
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
        paddingTop: '60px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100px',
          height: '100px',
          borderRadius: '24px',
          backgroundColor: 'var(--color-primary)',
          boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)',
        }}>
          <Shield size={56} color="var(--color-text-inverse)" strokeWidth={2} />
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          textAlign: 'center',
        }}>
          <h1 style={{ margin: 0 }}>Universal ID Scanner</h1>
          <p style={{ 
            margin: 0, 
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            maxWidth: '280px',
          }}>
            Scan and verify IDs with enterprise-grade accuracy and privacy
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
      }}>
        <FeatureItem
          icon={<Zap size={24} color="var(--color-primary)" />}
          title="99% Accuracy"
          description="AI-powered OCR with instant data extraction"
        />
        <FeatureItem
          icon={<Lock size={24} color="var(--color-primary)" />}
          title="Privacy First"
          description="All processing done locally on your device"
        />
        <FeatureItem
          icon={<CheckCircle size={24} color="var(--color-success)" />}
          title="150+ ID Types"
          description="Supports IDs from 195 countries worldwide"
        />
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        paddingBottom: 'var(--spacing-lg)',
      }}>
        <Button variant="primary" fullWidth onClick={onGetStarted}>
          Get Started
        </Button>
        {/* <p className="caption" style={{ 
          margin: 0, 
          textAlign: 'center',
        }}>
          By continuing, you agree to our Terms & Privacy Policy
        </p> */}
        <div style={{ marginTop: '-30px'}}>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreenDesktop({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-2xl)',
    }}>
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-2xl)',
        maxWidth: '1200px',
        width: '100%',
        alignItems: 'center',
      }}>
        {/* Left Side - Hero */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xl)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-primary)',
            }}>
              <Shield size={36} color="var(--color-text-inverse)" strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '48px' }}>Universal ID Scanner</h1>
            </div>
          </div>

          <p style={{ 
            margin: 0, 
            fontSize: '20px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}>
            Enterprise-grade ID scanning and verification powered by AI. Scan driver's licenses, passports, and government-issued IDs with 99% accuracy while keeping your data secure.
          </p>

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            alignItems: 'center',
          }}>
            <Button 
              variant="primary" 
              onClick={onGetStarted}
              icon={<ArrowRight size={20} />}
            >
              Get Started
            </Button>
            <p className="caption" style={{ margin: 0 }}>
              Free • No account required
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-xl)',
            paddingTop: 'var(--spacing-lg)',
          }}>
            <StatItem value="99%" label="Accuracy" />
            <StatItem value="150+" label="ID Types" />
            <StatItem value="195" label="Countries" />
          </div>
        </div>

        {/* Right Side - Features */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-2xl)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
        }}>
          <h2 style={{ margin: 0 }}>Key Features</h2>
          
          <FeatureItem
            icon={<Zap size={28} color="var(--color-primary)" />}
            title="Instant Processing"
            description="Extract data in under 2 seconds with AI-powered OCR technology and smart validation"
          />
          <FeatureItem
            icon={<Lock size={28} color="var(--color-primary)" />}
            title="Privacy First"
            description="All data processing happens locally on your device. No external servers, no data storage"
          />
          <FeatureItem
            icon={<CheckCircle size={28} color="var(--color-success)" />}
            title="Verified Results"
            description="Advanced error detection and validation ensures accurate data extraction every time"
          />

          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}>
            <p className="caption" style={{ margin: 0, textAlign: 'center' }}>
              Trusted by enterprises worldwide for secure ID verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--spacing-md)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        minWidth: '48px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
      }}>
        {icon}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p className="caption" style={{ margin: 0 }}>{description}</p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 700, 
        color: 'var(--color-primary)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <p className="caption" style={{ margin: 0 }}>{label}</p>
    </div>
  );
}
