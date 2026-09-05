/**
 * Entidad de dominio: Solicitud
 * Estados canónicos según .policies/01 y 03
 */

export type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado';

export type KycResultado = 'approved' | 'declined' | 'expired' | 'failed';

export interface SolicitudProps {
  id: string;
  codigoSeguimiento: string;
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombrePersona: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  diditSessionId?: string;
  kycResultado?: KycResultado;
  notasInternas?: string;
  mensajePublico?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export class Solicitud {
  readonly id: string;
  readonly codigoSeguimiento: string;
  readonly nombreFamiliar: string;
  readonly email: string;
  readonly telefono?: string;
  readonly nombrePersona: string;
  readonly relacion: string;
  readonly descripcion: string;
  readonly estado: EstadoSolicitud;
  readonly diditSessionId?: string;
  readonly kycResultado?: KycResultado;
  readonly notasInternas?: string;
  readonly mensajePublico?: string;
  readonly fechaCreacion: string;
  readonly fechaActualizacion: string;

  private constructor(props: SolicitudProps) {
    this.id = props.id;
    this.codigoSeguimiento = props.codigoSeguimiento;
    this.nombreFamiliar = props.nombreFamiliar;
    this.email = props.email;
    this.telefono = props.telefono;
    this.nombrePersona = props.nombrePersona;
    this.relacion = props.relacion;
    this.descripcion = props.descripcion;
    this.estado = props.estado;
    this.diditSessionId = props.diditSessionId;
    this.kycResultado = props.kycResultado;
    this.notasInternas = props.notasInternas;
    this.mensajePublico = props.mensajePublico;
    this.fechaCreacion = props.fechaCreacion;
    this.fechaActualizacion = props.fechaActualizacion;
  }

  static crear(props: SolicitudProps): Solicitud {
    return new Solicitud(props);
  }

  static createNueva(input: {
    id: string;
    codigoSeguimiento: string;
    nombreFamiliar: string;
    email: string;
    telefono?: string;
    nombrePersona: string;
    relacion: string;
    descripcion: string;
    ahora: string;
  }): Solicitud {
    return new Solicitud({
      ...input,
      estado: 'pendiente',
      fechaCreacion: input.ahora,
      fechaActualizacion: input.ahora,
    });
  }

  /** Transición: pendiente → sin_verificar (inicio negociaciones + KYC) */
  marcarSinVerificar(params: {
    diditSessionId: string;
    notasInternas?: string;
    mensajePublico?: string;
    ahora: string;
  }): Solicitud {
    if (this.estado !== 'pendiente') {
      throw new DomainError(
        'INVALID_TRANSITION',
        `No se puede pasar a sin_verificar desde estado "${this.estado}"`,
      );
    }
    return new Solicitud({
      ...this.toProps(),
      estado: 'sin_verificar',
      diditSessionId: params.diditSessionId,
      notasInternas: params.notasInternas ?? this.notasInternas,
      mensajePublico:
        params.mensajePublico ??
        'Te enviamos un enlace para verificar tu identidad. Revisa tu correo.',
      fechaActualizacion: params.ahora,
    });
  }

  /** Transición: sin_verificar → verificado (KYC Approved) */
  marcarVerificado(params: { ahora: string; mensajePublico?: string }): Solicitud {
    if (this.estado !== 'sin_verificar') {
      throw new DomainError(
        'INVALID_TRANSITION',
        `No se puede pasar a verificado desde estado "${this.estado}"`,
      );
    }
    return new Solicitud({
      ...this.toProps(),
      estado: 'verificado',
      kycResultado: 'approved',
      mensajePublico:
        params.mensajePublico ?? 'Identidad verificada. Continuamos con tu caso.',
      fechaActualizacion: params.ahora,
    });
  }

  /** Registrar fallo KYC sin cambiar de sin_verificar */
  registrarFalloKyc(params: {
    resultado: Exclude<KycResultado, 'approved'>;
    ahora: string;
  }): Solicitud {
    if (this.estado !== 'sin_verificar') {
      throw new DomainError(
        'INVALID_STATE',
        'Solo se registra fallo KYC en estado sin_verificar',
      );
    }
    return new Solicitud({
      ...this.toProps(),
      kycResultado: params.resultado,
      fechaActualizacion: params.ahora,
    });
  }

  /** Cierre desde cualquier estado */
  cerrar(params: {
    motivoInterno: string;
    mensajePublico?: string;
    ahora: string;
  }): Solicitud {
    if (this.estado === 'cerrado') {
      throw new DomainError('INVALID_TRANSITION', 'La solicitud ya está cerrada');
    }
    if (!params.motivoInterno.trim()) {
      throw new DomainError('VALIDATION', 'El cierre requiere motivo interno');
    }
    return new Solicitud({
      ...this.toProps(),
      estado: 'cerrado',
      notasInternas: [this.notasInternas, `Cierre: ${params.motivoInterno}`]
        .filter(Boolean)
        .join('\n'),
      mensajePublico: params.mensajePublico ?? 'El proceso de tu solicitud ha sido cerrado.',
      fechaActualizacion: params.ahora,
    });
  }

  /** Vista pública (tracking) — sin notas internas ni ids sensibles de más */
  toVistaPublica() {
    return {
      codigoSeguimiento: this.codigoSeguimiento,
      estado: this.estado,
      mensajePublico: this.mensajePublico,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
      kycCompletado: this.estado === 'verificado' || this.estado === 'cerrado',
    };
  }

  toProps(): SolicitudProps {
    return {
      id: this.id,
      codigoSeguimiento: this.codigoSeguimiento,
      nombreFamiliar: this.nombreFamiliar,
      email: this.email,
      telefono: this.telefono,
      nombrePersona: this.nombrePersona,
      relacion: this.relacion,
      descripcion: this.descripcion,
      estado: this.estado,
      diditSessionId: this.diditSessionId,
      kycResultado: this.kycResultado,
      notasInternas: this.notasInternas,
      mensajePublico: this.mensajePublico,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
    };
  }
}

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
