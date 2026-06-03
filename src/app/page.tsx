import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      
      {/* Luces decorativas en CSS puro */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Tarjeta con efecto cristal como tus referencias de RonDesignLab */}
      <div className="glass-container">
        
        <span style={{
          fontSize: '11px',
          color: '#a78bfa',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '16px'
        }}>
          ✦ Nexus User Manager v1.0
        </span>

        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 800, 
          letterSpacing: '-1px',
          lineHeight: '1.2',
          marginBottom: '16px',
          color: '#ffffff'
        }}>
          Control Absoluto en una <br />
          <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#a1a1aa' }}>Interfaz Minimalista</span>
        </h1>

        <p style={{ color: '#71717a', fontSize: '15px', fontWeight: 300, lineHeight: '1.6' }}>
          Sincronización en tiempo real con MongoDB, arquitectura limpia y componentes modulares de alto rendimiento.
        </p>

        {/* Botón interactivo hacia el login */}
        <Link href="/login" className="btn-nexus">
          Ingresar al Sistema →
        </Link>
      </div>
    </div>
  );
}