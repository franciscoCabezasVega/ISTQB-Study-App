-- Agregar campo custom_days a study_reminders para permitir selección de días específicos
-- cuando el usuario elige frequency = 'custom'

-- Agregar columna custom_days como array de integers (0=domingo, 1=lunes, ..., 6=sábado)
ALTER TABLE public.study_reminders
ADD COLUMN IF NOT EXISTS custom_days integer[] DEFAULT NULL;

-- Agregar constraint para validar que los días estén en el rango 0-6
ALTER TABLE public.study_reminders
ADD CONSTRAINT custom_days_valid_range 
CHECK (
  custom_days IS NULL OR 
  (
    array_length(custom_days, 1) > 0 AND
    custom_days <@ ARRAY[0,1,2,3,4,5,6]
  )
);

-- Agregar comentario explicativo
COMMENT ON COLUMN public.study_reminders.custom_days IS 
'Array of integers representing days of the week (0=Sunday, 1=Monday, ..., 6=Saturday). Used when frequency is set to ''custom'' to specify which days reminders should be sent.';

-- Ejemplo de uso:
-- custom_days = [1, 3, 5] significa recordatorios los lunes, miércoles y viernes
-- NULL significa no hay días específicos configurados
